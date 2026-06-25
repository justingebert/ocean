import React from "react";
import { UserProperties } from "../../types/user";

export interface ProfileCardProps {
  user?: UserProperties;

  loading?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user, loading }) => {
  const renderFullName = (): React.ReactElement => {
    if (loading) {
      return <dd className="mt-1 animate-pulse h-4 w-32 bg-gray-200" />;
    } else if (user) {
      return (
        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{`${user.firstName} ${user.lastName}`}</dd>
      );
    } else {
      return <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">..</dd>;
    }
  };

  const renderEmployeType = (): React.ReactElement => {
    if (loading) {
      return <dd className="mt-1 animate-pulse h-4 w-24 bg-gray-200" />;
    } else if (user) {
      return (
        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.employeeType}</dd>
      );
    } else {
      return <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">..</dd>;
    }
  };

  const renderMail = (): React.ReactElement => {
    if (loading) {
      return <dd className="mt-1 animate-pulse h-4 w-48 bg-gray-200" />;
    } else if (user) {
      return <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.mail}</dd>;
    } else {
      return <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">..</dd>;
    }
  };

  const renderUsername = (): React.ReactElement => {
    if (loading) {
      return <dd className="mt-1 animate-pulse h-4 w-32 bg-gray-200" />;
    } else if (user) {
      return <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.username}</dd>;
    } else {
      return <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">..</dd>;
    }
  };

  return (
    <div>
      <div className="mt-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Profile</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal account details.</p>
      </div>
      <div className="mt-5 border-t border-gray-200">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">Full name</dt>
            {renderFullName()}
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">Employee type</dt>
            {renderEmployeType()}
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">Email address</dt>
            {renderMail()}
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">Username</dt>
            {renderUsername()}
          </div>
        </dl>
      </div>
    </div>
  );
};

export default ProfileCard;
