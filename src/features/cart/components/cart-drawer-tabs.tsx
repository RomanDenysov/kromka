"use client";

import { type ReactNode, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type Props = {
  b2cContent: ReactNode;
  b2cFooter: ReactNode;
  b2bContent: ReactNode;
  b2bFooter: ReactNode;
};

export function CartDrawerTabs({
  b2cContent,
  b2cFooter,
  b2bContent,
  b2bFooter,
}: Props) {
  const [activeTab, setActiveTab] = useState("b2c");

  return (
    <Tabs
      className="flex size-full flex-col overflow-hidden"
      onValueChange={setActiveTab}
      value={activeTab}
    >
      <div className="px-4 pt-2">
        <TabsList className="w-full">
          <TabsTrigger className="flex-1" value="b2c">
            E-shop
          </TabsTrigger>
          <TabsTrigger className="flex-1" value="b2b">
            B2B
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent className="flex-1 overflow-hidden" value="b2c">
        <div className="flex size-full flex-col">
          <div className="flex-1 overflow-y-auto">{b2cContent}</div>
          {b2cFooter}
        </div>
      </TabsContent>

      <TabsContent className="flex-1 overflow-hidden" value="b2b">
        <div className="flex size-full flex-col">
          <div className="flex-1 overflow-y-auto">{b2bContent}</div>
          {b2bFooter}
        </div>
      </TabsContent>
    </Tabs>
  );
}
