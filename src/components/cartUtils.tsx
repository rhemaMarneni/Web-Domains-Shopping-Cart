import { Map } from "immutable";
import { Dispatch, SetStateAction } from "react";

type AlertStatus = "success" | "error" | "warning" | "info";

// Counts the number of available domains
export const countAvailable = (currentDomains: Map<string, string>): number => {
  let availableCount = 0;
  currentDomains.forEach((availabilityStatus) => {
    if (availabilityStatus === "available") {
      availableCount++;
    }
  });
  return availableCount;
};

// Deletes a domain from the cart and checks cart status
export const deleteItem = (
  domain: string,
  domains: Map<string, string>,
  setDomains: (domains: Map<string, string>) => void,
  checkCartStatus: (currentDomains: Map<string, string>) => void
): void => {
  // Create a new updated map by deleting the domain
  const updatedDomains = domains.delete(domain) as Map<string, string>;
  // Update the state and check the cart status
  setDomains(updatedDomains);
  checkCartStatus(updatedDomains);
};

// Copy domains to clipboard and show alert
export const copyToClipboard = (
  domains: Map<string, string>,
  setAlertStatus: Dispatch<SetStateAction<AlertStatus>>,
  setAlertTitle: (title: string) => void,
  setAlertDescription: (description: string) => void,
  setIsAlertVisible: (visible: boolean) => void
): void => {
  const domainList = domains.keySeq().toArray().join(", ");

  navigator.clipboard
    .writeText(domainList)
    .then(() => {
      setAlertStatus(domainList !== "" ? "success" : "info");
      setAlertTitle("");
      setAlertDescription(
        domainList !== "" ? "Data copied to clipboard" : "Cart is empty"
      );
      setIsAlertVisible(true); // Show the alert on successful copy
      setTimeout(() => {
        setIsAlertVisible(false); // Hide the alert after a few seconds
      }, 3000);
    })
    .catch((error) => {
      console.error("Failed to copy: ", error);
    });
};

//clear cart
export const deleteCart = (
  setDomains: (domains: Map<string, string>) => void,
  setCartStatus: (status: string) => void
): void => {
  setDomains(Map()); // Clear the domains
  setCartStatus(""); // Reset the cart status
};

//check cart status
export const checkCartStatus = (
  currentDomains: Map<string, string>,
  maxDomains: number,
  setEnablePurchaseButton: (enabled: boolean) => void,
  setCartStatus: (status: string) => void,
  countAvailable: (domains: Map<string, string>) => number
): void => {
  const currentCartSize = currentDomains.size;

  if (currentCartSize > maxDomains) {
    setEnablePurchaseButton(false);
    setCartStatus(
      `Number of Cart items exceeded. Remove ${currentCartSize - maxDomains} domains to proceed to purchase`
    );
    return;
  }

  if (currentCartSize < maxDomains) {
    setEnablePurchaseButton(false);
    setCartStatus(
      `Add ${maxDomains - currentCartSize} more domains to proceed to purchase`
    );
    return;
  }

  if (currentCartSize === maxDomains) {
    const availableCount: number = countAvailable(currentDomains);

    if (availableCount === maxDomains) {
      setCartStatus("Cart Ready for purchase");
      setEnablePurchaseButton(true);
    } else {
      setCartStatus("Remove unavailable domains to proceed to purchase");
    }
    return;
  }
};