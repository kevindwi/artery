import { createAccessControl } from "better-auth/plugins/access";
import {
  defaultStatements,
  ownerAc,
  adminAc,
  memberAc,
} from "better-auth/plugins/organization/access";

const statement = {
  ...defaultStatements, // Include default (organization, member, invitation)
  template: ["create", "update", "delete", "read"],
  datastream: ["create", "update", "delete", "read"],
  device: ["create", "update", "delete", "read", "provision"],
  telemetry: ["read", "export"],
} as const;

export const ac = createAccessControl(statement);

// Define roles
export const member = ac.newRole({
  ...memberAc.statements, // Include default member permissions
  template: ["read"],
  datastream: ["read"],
  device: ["read"],
  telemetry: ["read"],
});

export const admin = ac.newRole({
  ...adminAc.statements, // Include default admin permissions
  template: ["create", "update", "delete", "read"],
  datastream: ["create", "update", "delete", "read"],
  device: ["create", "update", "delete", "read"],
  telemetry: ["read", "export"],
});

export const owner = ac.newRole({
  ...ownerAc.statements, // Include default owner permissions
  template: ["create", "update", "delete", "read"],
  datastream: ["create", "update", "delete", "read"],
  device: ["create", "update", "delete", "read", "provision"],
  telemetry: ["read", "export"],
});
