import { Button } from '@/components/ui/button';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { Fragment } from 'react/jsx-runtime';
import Crisp from './crisp';
import Google from './google';
import TinyMCE from './tinymce';

export default function ThirdPartyPlugin({ form }) {
    return (
        <div className="space-y-4">
            <TabGroup>
                <TabList className="">
                    <div className="flex w-full items-center gap-2">
                        <div className="hide-scrollbar -mb-px grid w-full transform grid-cols-2 items-center gap-2 overflow-auto duration-300 ease-in-out sm:grid-cols-3 md:gap-2 lg:grid-cols-4">
                            {['Google', 'Tiny MCE', 'Crisp'].map((label) => (
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
                        <Google form={form} />
                    </TabPanel>
                    <TabPanel>
                        <TinyMCE form={form} />
                    </TabPanel>
                    <TabPanel>
                        <Crisp form={form} />
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </div>
    );
}
