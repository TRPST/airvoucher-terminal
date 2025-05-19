import * as React from "react";

export default function VoucherTestPage() {
  console.log("*** TEST PAGE RENDERING ***");

  React.useEffect(() => {
    console.log("*** TEST PAGE MOUNTED ***");
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Test Page</h1>
      <p>If you can see this, the routing is working correctly.</p>
    </div>
  );
}
