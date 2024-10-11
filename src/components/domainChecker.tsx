/**
 * This module checks if the input domain is acceptable and proper before adding to cart
 */

import { Dispatch, SetStateAction } from "react";
import { Map } from "immutable";

/**
 *
 * @param input input domain by user before adding to cart
 * @param domains all current domains
 * @param setInputStatus prompt displayed after judging domain
 * @param setInputStatusColor setting prompt color
 * @param setEnableAddButton enables/disables 'add to cart' button based on input
 * @param domainRegex checks input against this regex
 * @returns
 */
export const checkAcceptableDomain = (
  input: string,
  domains: Map<string, string>,
  setInputStatus: Dispatch<SetStateAction<string>>,
  setInputStatusColor: Dispatch<SetStateAction<string>>,
  setEnableAddButton: Dispatch<SetStateAction<boolean>>,
  domainRegex: RegExp
): void => {
  //converts input into lowercase
  const lowerCaseDomain = input.toLowerCase().trim();
  const validExtensions = /\.(com|app|xyz)$/;
  //empty input is no-op
  if (lowerCaseDomain === "") {
    setInputStatus("");
    setInputStatusColor("");
    setEnableAddButton(false);
    return;
  } else if (domainRegex.test(lowerCaseDomain)) {
    // Check if the domain is already in the cart - no-op and alert user, 'add to cart' disabled
    if (domains.has(lowerCaseDomain)) {
      setInputStatus("Already existing in cart");
      setInputStatusColor("yellow.500");
      setEnableAddButton(false);
    } else {
      // acdceptable domain, so 'add to cart' enabled
      setInputStatus("Acceptable domain");
      setInputStatusColor("green.800");
      setEnableAddButton(true);
    }
  } else if (
    lowerCaseDomain.includes(".") &&
    lowerCaseDomain.split(".").length > 1
  ) {
    if (!validExtensions.test(lowerCaseDomain)) {
      // Improper domain - not ending with .com, .app, or .xyz
      setInputStatus("Improper domain - must end with .com, .app, or .xyz");
      setInputStatusColor("yellow.500");
      setEnableAddButton(false);
    }
  } else {
    //improper domain, so 'add to cart' disabled
    setInputStatus("Improper domain");
    setInputStatusColor("yellow.500");
    setEnableAddButton(false);
  }
};
