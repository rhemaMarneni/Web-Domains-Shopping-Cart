"use client";
import React, { useState, ChangeEvent, useRef } from "react";
import { ButtonGroup, ChakraProvider } from "@chakra-ui/react";
import {
  Box,
  Input,
  Text,
  Button,
  Flex,
  Spacer,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import {
  CheckCircleIcon,
  CloseIcon,
  Icon,
  CopyIcon,
  DeleteIcon,
} from "@chakra-ui/icons";
import { Map } from "immutable";
import { useClipboard } from "@chakra-ui/react";
import { checkAcceptableDomain } from "./domainChecker";
import {
  countAvailable,
  deleteItem,
  deleteCart,
  checkCartStatus,
} from "./cartUtils";
import ClearCartDialog from './clearCart';
import CustomButton from './customButton';

export interface ChallengeProps {
  /**
   * The maximum number of domains the user is allowed to have
   * in their cart. Invalid domains count toward this limit as well.
   */
  maxDomains: number;
}

export function Challenge(props: ChallengeProps) {
  const { maxDomains } = props;
  const [domains, setDomains] = useState<Map<string, string>>(Map());
  const [domain, setDomain] = useState<string>(""); // To store the current input
  const [cartStatus, setCartStatus] = useState<string>("Add items to cart"); //set cart status
  const [inputStatus, setInputStatus] = useState<string>(""); // To store the input status message
  const [inputStatusColor, setInputStatusColor] = useState<string>(""); // To store the input status message's color
  const [enableAddButton, setEnableAddButton] = useState<boolean>(false); //add to cart button
  const [enablePurchaseButton, setEnablePurchaseButton] =
    useState<boolean>(false); //purchase button
  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false); // for alerts
  const [alertTitle, setAlertTitle] = useState<string>("");
  const [alertDescription, setAlertDescription] = useState<string>("");
  type AlertStatus = "success" | "error" | "warning" | "info";
  const [alertStatus, setAlertStatus] = useState<AlertStatus>("success");
  const { hasCopied, value, setValue, onCopy } = useClipboard("");

  /**
   * uses Chakra UI's useClipboard and sets appropriate alert
   */
  const handleCopy = () => {
    const domainList = domains.keySeq().toArray().join(", ");
    setValue(domainList);
    onCopy();

    if (hasCopied) {
      setAlertStatus(domainList !== "" ? "success" : "info");
      setAlertTitle("");
      setAlertDescription(
        domainList !== "" ? "Data copied to clipboard" : "Cart is empty"
      );
      setIsAlertVisible(true); // Show the alert on successful copy
      setTimeout(() => {
        setIsAlertVisible(false); // Hide the alert after a few seconds
      }, 3000);
    }
  };

  // Regex for acceptable domains
  const domainRegex = /^[a-zA-Z0-9-]+\.(com|app|xyz)$/;

  //to enable "add to cart" button on 'Enter' key
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    if (event.key === "Enter") {
      if (enableAddButton) {
        addToCart();
      }
    }
  };

  //to dynamically judge the input domain and give prompt message
  /**
   * @param e key presses from the user
   */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const inputValue: string = e.target.value;
    setDomain(inputValue.toLowerCase());
    checkAcceptableDomain(
      inputValue,
      domains,
      setInputStatus,
      setInputStatusColor,
      setEnableAddButton,
      domainRegex
    );
  };

  /**
   * click "add to cart" button => add items to cart
   * Makes a call to Mock API and checks if available
   * updates cart by adding new domain
   */
  const addToCart = async (): Promise<void> => {
    try {
      const response = await fetch("/api/hello", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain }),
      });
      const data: { name: string } = await response.json();
      const available: string = data.name;

      //add into map
      setDomains((prevDomains) => {
        const newDomains = prevDomains.set(domain, available);
        handleCheckStatus(newDomains); // Pass the updated map to checkCartStatus
        return newDomains;
      });

      setInputStatus("");
      setDomain("");
      setEnableAddButton(false);
      handleCheckStatus(domains);
    } catch (error) {
      console.error("Error checking domain availability:", error);
    }
  };

  /**
   * Clears cart
   */
  const handleClearCart = () => {
    if (domains.size === 0) {
      setAlertDescription("Cart is empty");
    } else {
      setAlertDescription("Cart cleared");
    }
    deleteCart(setDomains, setCartStatus);
    setAlertStatus("info");
    setAlertTitle("");
    setIsAlertVisible(true); // Show the alert on successful copy
    setTimeout(() => {
      setIsAlertVisible(false);
    }, 3000);
  };

  /**
   * checks cart status if reached maxDomains/ready for purchase/ exceeded maxDomains and other edge cases
   * @param domains all the domains in cart
   */
  const handleCheckStatus = (domains: Map<string, string>) => {
    checkCartStatus(
      domains,
      maxDomains,
      setEnablePurchaseButton,
      setCartStatus,
      countAvailable
    );
  };

  //handle cart optimization
  /**
   * removes the domains that are unavailable and updates cart
   */
  const removeUnavailable = (): void => {
    const unavailableCount = domains.size - countAvailable(domains);
    if (unavailableCount === 0) {
      setAlertStatus("warning");
      setAlertTitle("");
      setAlertDescription("No unavailable domains in cart");
      setIsAlertVisible(true); // Show the alert on successful copy
      setTimeout(() => {
        setIsAlertVisible(false);
      }, 3000);
    } else {
      setDomains((prevDomains) => {
        const updatedDomains = prevDomains.filter(
          (availabilityStatus) => availabilityStatus === "available"
        );
        handleCheckStatus(updatedDomains);
        return updatedDomains;
      });
    }
  };

  /**
   * Filters cart according to
   * 1. .com > .app > .xyz
   * 2. tiebreaker1 - shorter domains > longer domains
   * 3. tiebreaker2 - lexicographic order
   */
  const keepBestDomains = (): void => {
    // removeUnavailable();
    const domainList = domains.keySeq().toArray();

    const sortOrder: Record<string, number> = {
      ".com": 1,
      ".app": 2,
      ".xyz": 3,
    };

    const sortedDomains = domainList.sort((a, b) => {
      const domainA = a.slice(a.lastIndexOf("."));
      const domainB = b.slice(b.lastIndexOf("."));

      // Compare domain order first
      const comparision =
        (sortOrder[domainA] ?? Infinity) - (sortOrder[domainB] ?? Infinity);

      // If domain endings are the same, compare by length
      if (comparision !== 0) {
        return comparision;
      }

      // If domain endings and lengths are the same, compare lexicographically
      return a.localeCompare(b);
    });

    // keep first "maxDomains" domains
    const domainsToKeep = new Set(sortedDomains.slice(0, maxDomains));

    // Update the state and check cart status
    setDomains((prevDomains) => {
      const updatedDomains = prevDomains.withMutations((map) => {
        // Iterate through the original domains and delete those not in domainsToKeep
        prevDomains.forEach((status, domain) => {
          if (!domainsToKeep.has(domain)) {
            map.delete(domain); // Remove from the updated Map
          }
        });
      });
      handleCheckStatus(updatedDomains); // Check the cart status after the update

      setAlertStatus("info");
      setAlertTitle("");
      setAlertDescription("Cart Optimized");
      setIsAlertVisible(true); // Show the alert on successful copy
      setTimeout(() => {
        setIsAlertVisible(false); // Hide the alert after a few seconds
      }, 3000);
      return updatedDomains; // Return the updated Map
    });
  };

  /**
   * Since there is no action for 'purchase' button, this function shows a success alert that the cart is satisfying all requirements
   */
  const purchaseAlert = (): void => {
    if (enablePurchaseButton) {
      setAlertStatus("success");
      setAlertTitle("Success");
      setAlertDescription("Customer can successfully purchase");
      setIsAlertVisible(true); // Show the alert on successful copy
      setTimeout(() => {
        setIsAlertVisible(false); // Hide the alert after a few seconds
      }, 3000);
    }
  };

  /**
   * copy to clipboard - imported from cartUtils.tsx
   */

  return (
    <>
      <ChakraProvider>
        <Box display="flex" alignItems="center" justifyContent="center">
          <Box bg="white" p={6} mx={0} maxH="90vh" minW="70vw" overflowY="auto">
            {isAlertVisible && (
              <Alert
                status={alertStatus}
                m={4}
                position="absolute"
                top={0}
                zIndex={1}
                width={{ base: "90%", xs: "50px", md: "500px", lg: "300px" }}
              >
                <AlertIcon />
                <AlertTitle>{alertTitle}</AlertTitle>
                <AlertDescription>{alertDescription}</AlertDescription>
              </Alert>
            )}
            <Text fontSize={{ base: "xs", md: "sm", lg: "md" }} p={3}>
              Enter your domain name. A proper domain name would look like
              &quot;example.com&quot; or &quot;example.xyz&quot; or
              &quot;example.app&quot;
            </Text>
            {/* Input box + "add to cart" button*/}
            <Box display="flex" alignItems="center" justifyContent="center">
              <Input
                placeholder="Enter domain"
                _placeholder={{ fontSize: { base: "sm", md: "sm" } }}
                value={domain}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                size="lg"
                borderColor="gray.800"
                mr={4}
                p={4}
              />
              <Button
                colorScheme={enableAddButton ? "teal" : "gray"}
                p={5}
                fontSize={{ base: "xs", md: "md", sm: "xs" }}
                isActive={enableAddButton}
                isDisabled={!enableAddButton}
                cursor={enableAddButton ? "pointer" : "not-allowed"}
                onClick={enableAddButton ? addToCart : undefined}
              >
                Add to Cart
              </Button>
            </Box>
            {/* prompt message */}
            <Text
              fontSize={{ base: "xs", md: "sm", lg: "md" }}
              as="b"
              p={3}
              color={inputStatusColor}
            >
              {inputStatus}
            </Text>
            <Flex alignItems="center">
              {/* Cart heading */}
              <Text
                my={3}
                py={5}
                fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
              >
                Cart
              </Text>
              <Spacer />
              <Button
                colorScheme="gray"
                p={5}
                fontSize={{ base: "xs", md: "md", sm: "xs" }}
                onClick={handleCopy}
              >
                Copy Items
                <Icon
                  as={CopyIcon} // Use the CopyIcon here
                  color="gray.500"
                  boxSize={3} // Adjust size as needed
                  ml={2} // Add margin-left for spacing
                  cursor="pointer" // Change cursor to pointer for interaction
                />
              </Button>
            </Flex>
            {/* Cart settings */}
            <Flex
              justifyContent="flex-end"
              gap={5}
              direction={{ base: "column", md: "row" }}
            >
              <CustomButton label="Remove Unavailable" onClick={removeUnavailable} />
              <CustomButton label={`Keep ${maxDomains} best`} onClick={keepBestDomains} />
            </Flex>

            {/* Cart */}
            <Box>
              {domains.size > 0 ? (
                <ul>
                  {/* Map over the entries in the Immutable Map */}
                  {domains
                    .entrySeq()
                    .map(([domainName, availabilityStatus]) => (
                      <li key={domainName}>
                        <Flex
                          py={3}
                          mb={4}
                          borderBottom="1px solid #ddd"
                          alignItems="center"
                          wrap="wrap"
                          justifyContent="space-between"
                        >
                          {/* Domain Name */}
                          <Text fontSize="md" as="strong">
                            {domainName}
                          </Text>
                          {/* Spacer to push availability status to the right */}
                          <Spacer />
                          {/* Availability Status */}
                          <Flex alignItems="center" marginLeft="auto">
                            <Text
                              fontSize={{ base: "xs", md: "sm", lg: "md" }}
                              mr={2}
                              color={
                                availabilityStatus === "available"
                                  ? "green.500"
                                  : "red.500"
                              }
                            >
                              {availabilityStatus}
                            </Text>
                            <Icon
                              as={
                                availabilityStatus === "available"
                                  ? CheckCircleIcon
                                  : CloseIcon
                              }
                              color={
                                availabilityStatus === "available"
                                  ? "green.500"
                                  : "red.500"
                              }
                              boxSize={3} // Adjust the size of the icon
                            />
                            <Icon
                              as={DeleteIcon}
                              color="gray.500"
                              _hover={{ color: "red.500" }}
                              boxSize={3}
                              ml={3}
                              cursor="pointer"
                              onClick={() => {
                                deleteItem(
                                  domainName,
                                  domains,
                                  setDomains,
                                  handleCheckStatus
                                );
                              }}
                            />
                          </Flex>
                        </Flex>
                      </li>
                    ))}
                </ul>
              ) : (
                // Display this message when the cart is empty
                <Text fontSize="lg" color="gray.500" textAlign="center" m={5}>
                  Cart is empty. Add domains to get started.
                </Text>
              )}
            </Box>
            {/* Cart info */}
            <Text fontSize={{ base: "xs", md: "sm", lg: "md" }} mt={6}>
              Cart: {domains.size} of {maxDomains} domains
            </Text>
            <Text fontSize={{ base: "xs", md: "sm", lg: "md" }} mb={3}>
              {cartStatus}
            </Text>
            <Flex justifyContent="flex-end">
              <ButtonGroup gap="2">
                <ClearCartDialog onClear={handleClearCart} />
                {/* Use the ClearCartDialog component */}
                <Spacer />
                <Button
                  bg="black"
                  color="white"
                  p={3}
                  fontSize={{ base: "xs", sm: "xs", md: "md" }}
                  isDisabled={!enablePurchaseButton}
                  cursor={enablePurchaseButton ? "pointer" : "not-allowed"}
                  _hover={{}}
                  onClick={purchaseAlert}
                >
                  Purchase
                </Button>
              </ButtonGroup>
            </Flex>
          </Box>
        </Box>
      </ChakraProvider>
    </>
  );
}
