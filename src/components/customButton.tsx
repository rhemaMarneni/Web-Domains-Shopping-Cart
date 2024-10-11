// CustomButton.tsx
import React from 'react';
import { Button, ButtonProps } from '@chakra-ui/react';

/**
 * interface for thr custom button
 */
interface CustomButtonProps extends ButtonProps {
  label: string;
  onClick: () => void;
  variant?: string;
  colorScheme?: string;
}

/**
 * @param param0 react button for custom attributes
 * @returns button
 */
const CustomButton: React.FC<CustomButtonProps> = ({ label, onClick, variant, colorScheme, ...props }) => {
  return (
    <Button onClick={onClick} variant={variant} colorScheme={colorScheme} fontSize={{ base: "xs", sm: "xs", md: "md" }} color="teal" bg="gray.50" border="1px" borderColor="teal" {...props}>
      {label}
    </Button>
  );
};

export default CustomButton;