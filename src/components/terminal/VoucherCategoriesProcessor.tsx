import * as React from 'react';
import { CreditCard, Wallet, Percent, Tags, Settings, FileText } from 'lucide-react';

type VoucherCategory = {
  name: string;
  icon: React.ReactNode;
  color: string;
};

type ProcessedCategory = {
  name: string;
  items: VoucherCategory[];
};

export function useVoucherCategories(voucherTypeNames: string[]) {
  return React.useMemo(() => {
    if (!voucherTypeNames || voucherTypeNames.length === 0) {
      return [];
    }

    // Filter out any empty or undefined names
    const validVoucherTypeNames = voucherTypeNames.filter((name) => name && name.trim() !== '');

    // Categorize voucher types into Mobile Networks and Other Services
    // First, get unique mobile network providers
    const networkProviders = ['Vodacom', 'MTN', 'CellC', 'Telkom'];
    const availableNetworks = networkProviders.filter((network) =>
      validVoucherTypeNames.some((name) => name && name.includes(network))
    );

    const mobileNetworks = availableNetworks.map((network) => {
      let icon = <CreditCard className="h-6 w-6" />;
      let color = 'bg-primary/5 hover:bg-primary/10 dark:bg-primary/10 dark:hover:bg-primary/20';

      if (network === 'Vodacom') {
        icon = (
          <img
            src="/assets/vouchers/vodacom-logo.png"
            alt="Vodacom"
            className="h-full w-full rounded-lg object-cover"
          />
        );
        color = 'bg-primary/5 hover:bg-primary/10 dark:bg-primary/10 dark:hover:bg-primary/20';
      } else if (network === 'MTN') {
        icon = (
          <img
            src="/assets/vouchers/mtn-logo.jpg"
            alt="MTN"
            className="h-full w-full rounded-lg object-cover"
          />
        );
        color =
          'bg-yellow-500/5 hover:bg-yellow-500/10 dark:bg-yellow-500/10 dark:hover:bg-yellow-500/20';
      } else if (network === 'CellC') {
        icon = (
          <img
            src="/assets/vouchers/cellc-logo.png"
            alt="Cell C"
            className="h-full w-full rounded-lg object-cover"
          />
        );
        color =
          'bg-indigo-500/5 hover:bg-indigo-500/10 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20';
      } else if (network === 'Telkom') {
        icon = (
          <img
            src="/assets/vouchers/telkom-logo.png"
            alt="Telkom"
            className="h-full w-full rounded-lg object-cover"
          />
        );
        color = 'bg-teal-500/5 hover:bg-teal-500/10 dark:bg-teal-500/10 dark:hover:bg-teal-500/20';
      }

      return {
        name: network,
        icon,
        color,
      };
    });

    // Filter otherServices to exclude any bill payment options
    const otherServices = validVoucherTypeNames
      .filter((name) => {
        // Skip mobile networks (already handled)
        if (
          ['Vodacom', 'MTN', 'CellC', 'Telkom'].some((network) => name && name.includes(network))
        ) {
          return false;
        }

        // Skip bill payment options
        if (
          ['MangaungMunicipality', 'Mukuru', 'Ecocash', 'HelloPaisa', 'DSTV'].some(
            (option) => name && name.includes(option)
          )
        ) {
          return false;
        }

        // Also skip any empty or null items
        if (!name || name.trim() === '') {
          return false;
        }

        return true;
      })
      .map((name, index) => {
        let icon = <CreditCard className="h-6 w-6" />;
        let color = 'bg-primary/5 hover:bg-primary/10 dark:bg-primary/10 dark:hover:bg-primary/20';

        const categoryName = name?.split(' ')[0] || name;

        // Assign different icons and colors based on name
        switch (categoryName?.toLowerCase()) {
          case 'ott':
          case 'netflix':
          case 'showmax':
            icon = (
              <img
                src="/assets/vouchers/ott-logo.png"
                alt="OTT"
                className="h-full w-full rounded-lg object-cover"
              />
            );
            color =
              'bg-purple-500/5 hover:bg-purple-500/10 dark:bg-purple-500/10 dark:hover:bg-purple-500/20';
            break;
          case 'betting':
          case 'hollywoodbets':
          case 'betway':
            icon = (
              <img
                src="/assets/vouchers/hollywoodbets-logo.jpg"
                alt="Hollywoodbets"
                className="h-full w-full rounded-lg object-cover"
              />
            );
            color =
              'bg-green-500/5 hover:bg-green-500/10 dark:bg-green-500/10 dark:hover:bg-green-500/20';
            break;
          case 'ringa':
            icon = (
              <img
                src="/assets/vouchers/ringas-logo.jpg"
                alt="Ringas"
                className="h-full w-full rounded-lg object-cover"
              />
            );
            color =
              'bg-amber-500/5 hover:bg-amber-500/10 dark:bg-amber-500/10 dark:hover:bg-amber-500/20';
            break;
          case 'easyload':
            icon = (
              <img
                src="/assets/vouchers/easyload-logo.png"
                alt="Easyload"
                className="h-24 w-auto max-w-full rounded-lg object-contain"
              />
            );
            color =
              'bg-green-500/5 hover:bg-green-500/10 dark:bg-green-500/10 dark:hover:bg-green-500/20';
            break;
          case 'globalairtime':
            icon = (
              <img
                src="/assets/vouchers/global-airtime-logo.jpg"
                alt="Global Airtime"
                className="h-full w-full rounded-lg object-cover"
              />
            );
            color =
              'bg-green-500/5 hover:bg-green-500/10 dark:bg-green-500/10 dark:hover:bg-green-500/20';
            break;
          case 'dstv':
            icon = (
              <img
                src="/assets/vouchers/dstv-logo.png"
                alt="DSTV"
                className="h-full w-full rounded-lg object-cover"
              />
            );
            color =
              'bg-blue-500/5 hover:bg-blue-500/10 dark:bg-blue-500/10 dark:hover:bg-blue-500/20';
            break;
          case 'hellopaisa':
            icon = (
              <img
                src="/assets/vouchers/hellopaisa-logo.png"
                alt="Hello Pesa"
                className="h-full w-full rounded-lg object-cover"
              />
            );
            color =
              'bg-green-500/5 hover:bg-green-500/10 dark:bg-green-500/10 dark:hover:bg-green-500/20';
            break;
          case 'eskom':
            icon = (
              <img
                src="/assets/vouchers/eskom-logo.jpg"
                alt="Eskom"
                className="h-full w-full rounded-lg object-cover"
              />
            );
            color = 'bg-red-500/5 hover:bg-red-500/10 dark:bg-red-500/10 dark:hover:bg-red-500/20';
            break;
          case 'unipin':
            icon = (
              <img
                src="/assets/vouchers/unipin-logo.png"
                alt="Unipin"
                className="h-full w-full rounded-lg object-cover"
              />
            );
            color =
              'bg-blue-500/5 hover:bg-blue-500/10 dark:bg-blue-500/10 dark:hover:bg-blue-500/20';
            break;
          default:
            const colors = [
              'bg-amber-500/5 hover:bg-amber-500/10 dark:bg-amber-500/10 dark:hover:bg-amber-500/20',
              'bg-pink-500/5 hover:bg-pink-500/10 dark:bg-pink-500/10 dark:hover:bg-pink-500/20',
              'bg-teal-500/5 hover:bg-teal-500/10 dark:bg-teal-500/10 dark:hover:bg-teal-500/20',
              'bg-indigo-500/5 hover:bg-indigo-500/10 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20',
              'bg-red-500/5 hover:bg-red-500/10 dark:bg-red-500/10 dark:hover:bg-red-500/20',
            ];
            color = colors[index % colors.length];
            break;
        }

        return {
          name: categoryName,
          icon,
          color,
        };
      });

    // Define the order (use lowercase for matching)
    const serviceOrder = [
      'easyload',
      'ringa',
      'hollywoodbets',
      'ott',
      'globalairtime',
      'unipin',
      'eskom',
    ];

    // Reorder otherServices based on serviceOrder
    const reorderedServices: VoucherCategory[] = [];
    serviceOrder.forEach((serviceName) => {
      const service = otherServices.find((item) => item.name.toLowerCase() === serviceName);
      if (service) {
        reorderedServices.push(service);
      }
    });

    // Add any remaining services not in the order array
    otherServices.forEach((service) => {
      if (!reorderedServices.includes(service)) {
        reorderedServices.push(service);
      }
    });

    // Add Bill Payments button
    const billPaymentsButton = {
      name: 'Bill Payments',
      icon: <FileText className="h-8 w-8 text-blue-700 dark:text-blue-300" />,
      color: 'bg-blue-500/5 hover:bg-blue-500/10 dark:bg-blue-500/10 dark:hover:bg-blue-500/20',
    };

    // Add Admin button
    const adminButton = {
      name: 'Admin',
      icon: <Settings className="h-8 w-8 text-gray-700 dark:text-gray-300" />,
      color: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border-border',
    };

    const categories: ProcessedCategory[] = [];

    if (mobileNetworks.length > 0) {
      categories.push({
        name: 'Mobile Networks',
        items: mobileNetworks,
      });
    }

    if (reorderedServices.length > 0) {
      categories.push({
        name: 'Other Services',
        items: reorderedServices,
      });
    }

    // Add Bill Payments and Admin as a separate category
    categories.push({
      name: 'Services',
      items: [billPaymentsButton, adminButton],
    });

    return categories;
  }, [voucherTypeNames]);
}

export type { VoucherCategory, ProcessedCategory };
