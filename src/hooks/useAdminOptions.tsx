import * as React from 'react';

export function useAdminOptions() {
  // Admin state
  const [showAdminOptions, setShowAdminOptions] = React.useState(false);
  const [selectedAdminOption, setSelectedAdminOption] = React.useState<string | null>(null);

  // Bill Payments state
  const [showBillPayments, setShowBillPayments] = React.useState(false);
  const [selectedBillPayment, setSelectedBillPayment] = React.useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  // Handle category selection
  const handleCategorySelect = React.useCallback((category: string) => {
    if (category === 'Admin') {
      setShowAdminOptions(true);
      setShowBillPayments(false);
      setSelectedAdminOption(null);
    } else if (category === 'Bill Payments') {
      setShowBillPayments(true);
      setShowAdminOptions(false);
      setSelectedAdminOption(null);
    } else {
      setShowAdminOptions(false);
      setShowBillPayments(false);
    }
  }, []);

  // Handle Admin option selection
  const handleAdminOptionSelect = React.useCallback((option: string) => {
    setSelectedAdminOption(option);
    console.log(`Selected admin option: ${option}`);
  }, []);

  // Handle Bill Payment option selection
  const handleBillPaymentOptionSelect = React.useCallback((option: string) => {
    setSelectedBillPayment(option);
    console.log(`Selected bill payment option: ${option}`);
  }, []);

  // Handle back to Admin options
  const handleBackToAdmin = React.useCallback(() => {
    setSelectedAdminOption(null);
  }, []);

  // Handle back to categories
  const handleBackToCategories = React.useCallback(() => {
    setShowAdminOptions(false);
    setShowBillPayments(false);
    setSelectedAdminOption(null);
    setSelectedBillPayment(null);
    setSelectedCategory(null);
  }, []);

  return {
    // State
    showAdminOptions,
    selectedAdminOption,
    showBillPayments,
    selectedBillPayment,

    // Actions
    setShowAdminOptions,
    setSelectedAdminOption,
    setShowBillPayments,
    setSelectedBillPayment,
    handleCategorySelect,
    handleAdminOptionSelect,
    handleBillPaymentOptionSelect,
    handleBackToAdmin,
    handleBackToCategories,
  };
}
