import { format } from "date-fns";
import { sk } from "date-fns/locale";
import {
  BanIcon,
  CalendarIcon,
  MailIcon,
  PhoneIcon,
  VerifiedIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { User } from "@/features/user-management/api/queries";
import { getInitials } from "@/lib/utils";

type Props = {
  user: NonNullable<User>;
};

export function UserProfileCard({ user }: Props) {
  const isBanned = user.banned ?? false;
  const banExpired = user.banExpires && new Date(user.banExpires) < new Date();

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mb-4 flex justify-center">
          <Avatar className="h-20 w-20">
            <AvatarImage alt={user.name} src={user.image ?? undefined} />
            <AvatarFallback className="text-lg">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="text-xl">{user.name}</CardTitle>
        <CardDescription className="flex items-center justify-center gap-2">
          <MailIcon className="h-4 w-4" />
          {user.email}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <AccountStatusSection
          banExpired={banExpired ?? true}
          banExpires={user.banExpires}
          banReason={user.banReason}
          emailVerified={user.emailVerified}
          isBanned={isBanned}
          role={user.role}
        />
        <Separator />
        <ContactInfoSection email={user.email} phone={user.phone} />
        <Separator />
        <AccountDatesSection
          createdAt={user.createdAt}
          updatedAt={user.updatedAt}
        />
      </CardContent>
    </Card>
  );
}

function AccountStatusSection({
  isBanned,
  banExpired,
  banReason,
  banExpires,
  role,
  emailVerified,
}: {
  isBanned: boolean;
  banExpired: boolean;
  banReason: string | null | undefined;
  banExpires: Date | null | undefined;
  role: string;
  emailVerified: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">Status</span>
        <div className="flex items-center gap-2">
          {isBanned && !banExpired ? (
            <Badge className="gap-1" variant="destructive">
              <BanIcon className="h-3 w-3" />
              Zablokovaný
            </Badge>
          ) : (
            <Badge className="gap-1" variant="success">
              <VerifiedIcon className="h-3 w-3" />
              Aktívny
            </Badge>
          )}
        </div>
      </div>

      {isBanned && banReason && (
        <div className="rounded-md bg-destructive/10 p-2 text-sm">
          <div className="font-medium text-destructive">Dôvod:</div>
          <div className="text-muted-foreground">{banReason}</div>
          {banExpires && (
            <div className="mt-1 text-xs">
              Platné do:{" "}
              {format(new Date(banExpires), "d. M. yyyy", {
                locale: sk,
              })}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">Rola</span>
        <Badge variant="outline">{role}</Badge>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">Email overený</span>
        {emailVerified ? (
          <Badge className="gap-1" variant="success">
            <VerifiedIcon className="h-3 w-3" />
            Áno
          </Badge>
        ) : (
          <Badge variant="outline">Nie</Badge>
        )}
      </div>
    </div>
  );
}

function ContactInfoSection({
  phone,
  email,
}: {
  phone: string | null | undefined;
  email: string;
}) {
  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-sm">Kontaktné informácie</h4>
      {phone && (
        <div className="flex items-center gap-2 text-sm">
          <PhoneIcon className="h-4 w-4 text-muted-foreground" />
          <span>{phone}</span>
        </div>
      )}
      <div className="flex items-center gap-2 text-sm">
        <MailIcon className="h-4 w-4 text-muted-foreground" />
        <span>{email}</span>
      </div>
    </div>
  );
}

function AccountDatesSection({
  createdAt,
  updatedAt,
}: {
  createdAt: Date;
  updatedAt: Date | null | undefined;
}) {
  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-sm">Dátumy</h4>
      <div className="flex items-center gap-2 text-sm">
        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        <div className="flex flex-col">
          <span className="text-muted-foreground">Registrovaný:</span>
          <span>
            {format(new Date(createdAt), "d. M. yyyy", {
              locale: sk,
            })}
          </span>
        </div>
      </div>
      {updatedAt && (
        <div className="flex items-center gap-2 text-sm">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-muted-foreground">Aktualizovaný:</span>
            <span>
              {format(new Date(updatedAt), "d. M. yyyy", {
                locale: sk,
              })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
