import { Button } from '@/components/ui/button';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { Fragment } from 'react/jsx-runtime';
import Banner from './banner';
import Logo from './logo';
import Main from './main';
import Menu from './menu';
import MetaTag from './meta-tag';
import OrderExampleTarget from './order-example-target';
import OrderInfo from './order-info';
import Reviews from './reviews';
import Social from './social';
import Theme from './theme';

export default function Site({ form }) {
    return (
        <div className="space-y-4">
            <TabGroup>
                <TabList className="">
                    <div className="flex w-full items-center gap-2">
                        <div className="hide-scrollbar -mb-px grid w-full transform grid-cols-2 items-center gap-2 overflow-auto duration-300 ease-in-out sm:grid-cols-3 md:gap-2 lg:grid-cols-4">
                            {/* {['Main', 'Logo', 'Theme', 'Meta Tag', 'Banner', 'Social & Contact', 'Menu', 'Reviews', 'User Order Info'].map( */}
                            {[
                                'Main',
                                'Logo',
                                'Theme',
                                'Meta Tag',
                                'Banner',
                                'Social & Contact',
                                'Menu',
                                'Reviews',
                                'User Order Info',
                                'User Order Example Target',
                            ].map((label) => (
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
                        <Main form={form} />
                    </TabPanel>
                    <TabPanel>
                        <Logo form={form} />
                    </TabPanel>
                    <TabPanel>
                        <Theme form={form} />
                    </TabPanel>
                    <TabPanel>
                        <MetaTag form={form} />
                    </TabPanel>
                    <TabPanel>
                        <Banner form={form} />
                    </TabPanel>
                    <TabPanel>
                        <Social form={form} />
                    </TabPanel>
                    <TabPanel>
                        <Menu form={form} />
                    </TabPanel>
                    <TabPanel>
                        <Reviews form={form} />
                    </TabPanel>
                    <TabPanel>
                        <OrderInfo form={form} />
                    </TabPanel>
                    <TabPanel>
                        <OrderExampleTarget form={form} />
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </div>
    );
}
