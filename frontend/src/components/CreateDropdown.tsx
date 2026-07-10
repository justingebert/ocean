import React from "react";
import { Link } from "react-router-dom";

import { ChevronDownIcon, DatabaseIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { routePaths } from "../navigation/routes.ts";

const CreateDropdown: React.FC = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button />}>
        Create
        <ChevronDownIcon data-icon="inline-end" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem render={<Link to={routePaths.createDatabase} />}>
          <DatabaseIcon data-icon="inline-start" />
          Databases
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CreateDropdown;
