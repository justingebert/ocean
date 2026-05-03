/*import React, { useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { InvitationList } from './InvitationList';
import { IInvitedUser } from './InvitationListEntry';


export default {
    title: 'Lists/InvitationList',
    component: InvitationList,
} as ComponentMeta<typeof InvitationList>;

const fixture: IInvitedUser[] = [
    {
        id: 1,
        username: "username1",
        firstName: "firstName1",
        lastName: "lastName1",
        createdAt: new Date(),
        invitationId: 2,
    },
    {
        id: 2,
        username: "username2",
        firstName: "firstName2",
        lastName: "lastName2",
        createdAt: new Date(),
        invitationId: 2,
    }
]

const Template: ComponentStory<typeof InvitationList> = (args) => {
    const [invitedUsers, setInvitedUsers] = useState([...fixture])
    return <InvitationList {...args} invitedUsers={invitedUsers} onDelete={() => setInvitedUsers([])} />
}

export const Default = Template.bind({});
Default.args = {};*/
