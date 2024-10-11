import React, { forwardRef } from 'react';
import {
  Button,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useDisclosure,
} from '@chakra-ui/react';

interface ClearCartDialogProps {
  onClear: () => void;
}

/**
 * alert for clear cart
 * asks for confirmation before clearing cart
 * If Yes - redirects to deleteCart()
 */
const ClearCartDialog = forwardRef<HTMLButtonElement, ClearCartDialogProps>(
  ({ onClear }, ref) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = React.useRef<HTMLButtonElement>(null);

    return (
      <>
        <Button
          variant="outline"
          color="red"
          p={5}
          fontSize={{ base: "xs", md: "md", sm: "xs" }}
          onClick={onOpen}
          ref={ref}
        >
          Clear Cart
        </Button>
        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Customer
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure? You cannot undo this action afterwards.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={() => {
                    onClear();
                    onClose();
                  }}
                  ml={3}
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </>
    );
  }
);
ClearCartDialog.displayName = "ClearCartDialog";
export default ClearCartDialog;