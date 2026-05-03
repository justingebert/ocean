/*import React, { useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Tabs } from './Tabs';
import { ITab } from './Tab';


export default {
    title: 'Navigation/Tabs',
    component: Tabs,
} as ComponentMeta<typeof Tabs>;

const Template: ComponentStory<typeof Tabs> = (args) => {
    const [activeId, setActiveId] = useState(NaN)
    const tabs: ReadonlyArray<ITab> = [
        { id: 1, name: "Tab1" },
        { id: 2, name: "Tab2" },
        { id: 3, name: "Other" },
    ];
    return <Tabs {...args} tabs={tabs} activeId={activeId} onSelect={setActiveId} />
}

export const Default = Template.bind({});
Default.args = {
};*/
