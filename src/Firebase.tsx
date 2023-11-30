import { PropsWithChildren, useEffect } from "react";
import { observable } from "./push-notification";

export default function Firebase({ children }: PropsWithChildren) {
  useEffect(() => {
    observable.permission.subscribe((permission) => alert("Permission " + permission));
    observable.notification.subscribe((notification) => alert("Notification " + notification));
  }, []);

  return <div>{children}</div>;
}
