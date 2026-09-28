import React from "react";
import BacklogContent from "../backlogContent";

export default function SprintContent(props: any) {
  return <BacklogContent showOnlySprints={true} {...props} />;
}
