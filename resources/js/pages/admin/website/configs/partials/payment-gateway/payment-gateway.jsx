import { Button } from '@/components/ui/button';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { Fragment } from 'react/jsx-runtime';
import Cryptomus from './cryptomus';
import Duitku from './duitku';
import Flazpay from './flazpay';
import Midtrans from './midtrans';
import Paydisini from './paydisini';
import Tokopay from './tokopay';
import Tripay from './tripay';

export default function PaymentGateway({ form }) {
    return (
        <div className="space-y-4">
            <TabGroup>
                <TabList className="">
                    <div className="flex w-full items-center gap-2">
                        <div className="hide-scrollbar -mb-px grid w-full transform grid-cols-2 items-center gap-2 overflow-auto duration-300 ease-in-out sm:grid-cols-3 md:gap-2 lg:grid-cols-4">
                            {['Tripay', 'Paydisini', 'Tokopay', 'Duitku', 'Midtrans', 'Cryptomus', 'Flazpay'].map((label) => (
                                <Tab key={label} as={Fragment}>
                                    {({ selected }) => (
                                        <Button size="sm" variant={selected ? 'default' : 'outline'}>
                                            {label}
                                        </Button>
                                    )}
                                </Tab>
                            ))}
                        </div>
                    </div>
                </TabList>
                <TabPanels className="mt-3 border-t border-dashed pt-3">
                    <TabPanel>
                        <Tripay form={form} />
                    </TabPanel>
                    <TabPanel>
                        <Paydisini form={form} />
                    </TabPanel>
                    <TabPanel>
                        <Tokopay form={form} />
                    </TabPanel>
                    <TabPanel>
                        <Duitku form={form} />
                    </TabPanel>
                    <TabPanel>
                        <Midtrans form={form} />
                    </TabPanel>
                    <TabPanel>
                        <Cryptomus form={form} />
                    </TabPanel>
                    <TabPanel>
                        <Flazpay form={form} />
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </div>
    );
}
