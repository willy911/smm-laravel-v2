import AuthLayout from "@/components/layouts/auth-layout";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import InputError from "@/components/ui/input-error";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { cn, toHTML } from "@/lib/utils";
import {
  Dialog as HeadlessDialog,
  DialogPanel as HeadlessDialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Link, usePage } from "@inertiajs/react";
import { Loading02Icon } from "hugeicons-react";
import { useForm } from "laravel-precognition-react-inertia";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function Signup({ pageProps }) {
  const { t, i18n } = useTranslation();
  const { locales } = usePage().props;
  const [isDialogOpened, setIsDialogOpened] = useState(false);
  const [isDialogAlreadyOpened, setIsDialogAlreadyOpened] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [openLocalePopover, setOpenLocalePopover] = useState(false);
  const form = useForm("post", route("user.auth.signup"), {
    user: {
      full_name: "",
      whatsapp: "",
      email: "",
      username: "",
      password: "",
      locale: i18n.language,
    },
  });

  form.setValidationTimeout(3000);

  const handleSubmit = (e) => {
    e.preventDefault();
    form.submit({
      preserveScroll: true,
      onSuccess: () => form.reset(),
      onError: () => {
        toast({
          variant: "error",
          description: t("common:toast.invalid-input"),
        });
      },
    });
  };

  useEffect(() => {
    if (
      form.data.user.full_name &&
      form.data.user.whatsapp &&
      form.data.user.email &&
      form.data.user.username &&
      form.data.user.password &&
      form.data.user.locale &&
      !form.hasErrors &&
      !isDialogAlreadyOpened
    ) {
      setIsDialogOpened(true);
      setIsDialogAlreadyOpened(true);
    }
  }, [form.data, form.hasErrors]);

  return (
    <>
      <AuthLayout pageTitle={t("common:labels.signup")}>
        <form className="p-6 md:p-6" onSubmit={handleSubmit} autoComplete="off">
          <div className="flex flex-col gap-4">
            <div className="space-y-0 text-center">
              <h1 className="text-xl font-medium">{t("auth:signup.header")}</h1>
              <p className="text-muted-foreground text-center text-sm">
                {t("auth:signup.description")}
              </p>
            </div>
            <div className="grid gap-2">
              <Label isRequired>{t("common:labels.full-name")}</Label>
              <Input
                value={form.data.user.full_name}
                onChange={(e) => {
                  form.setData((data) => ({
                    ...data,
                    user: {
                      ...data.user,
                      full_name: e.target.value,
                    },
                  }));
                }}
                onBlur={() => form.validate("user.full_name")}
                aria-invalid={form.invalid("user.full_name")}
                autoFocus
              />
              {form.invalid("user.full_name") && (
                <InputError message={form.errors["user.full_name"]} />
              )}
            </div>
            <div className="grid gap-2">
              <Label isRequired>{t("common:labels.whatsapp")}</Label>
              <Input
                type="number"
                value={form.data.user.whatsapp}
                onChange={(e) => {
                  form.setData((data) => ({
                    ...data,
                    user: {
                      ...data.user,
                      whatsapp: e.target.value,
                    },
                  }));
                }}
                onBlur={() => form.validate("user.whatsapp")}
                aria-invalid={form.invalid("user.whatsapp")}
              />
              {/* <InputMask
                            maskType="pattern"
                            prefix="+62"
                            format="+62 ###-####-####"
                            valueIsNumericString={true}
                            value={form.data.user.whatsapp}
                            onValueChange={(values) => {
                                form.setData((data) => ({
                                    ...data,
                                    user: {
                                        ...data.user,
                                        whatsapp: values.floatValue,
                                    },
                                }));
                            }}
                            onBlur={() => form.validate('user.whatsapp')}
                            aria-invalid={form.invalid('user.whatsapp')}
                        /> */}
              {form.invalid("user.whatsapp") && (
                <InputError message={form.errors["user.whatsapp"]} />
              )}
            </div>
            <div className="grid gap-2">
              <Label isRequired>{t("common:labels.email")}</Label>
              <Input
                type="email"
                value={form.data.user.email}
                onChange={(e) => {
                  form.setData((data) => ({
                    ...data,
                    user: {
                      ...data.user,
                      email: e.target.value,
                    },
                  }));
                }}
                onBlur={() => form.validate("user.email")}
                aria-invalid={form.invalid("user.email")}
              />
              {form.invalid("user.email") && (
                <InputError message={form.errors["user.email"]} />
              )}
            </div>
            <div className="grid gap-2">
              <Label isRequired>{t("common:labels.username")}</Label>
              <Input
                value={form.data.user.username}
                onChange={(e) => {
                  form.setData((data) => ({
                    user: {
                      ...data.user,
                      username: e.target.value,
                    },
                  }));
                }}
                onBlur={() => form.validate("user.username")}
                aria-invalid={form.invalid("user.username")}
              />
              {form.invalid("user.username") && (
                <InputError message={form.errors["user.username"]} />
              )}
            </div>
            <div className="grid gap-2">
              <Label isRequired>{t("common:labels.password")}</Label>
              <Input
                type="password"
                value={form.data.user.password}
                onChange={(e) => {
                  form.setData((data) => ({
                    user: {
                      ...data.user,
                      password: e.target.value,
                    },
                  }));
                }}
                onBlur={() => form.validate("user.password")}
                aria-invalid={form.invalid("user.password")}
              />
              {form.invalid("user.password") && (
                <InputError message={form.errors["user.password"]} />
              )}
            </div>
            <div className="grid gap-2">
              <Label isRequired>
                {t("common:labels.language")} & {t("common:labels.currency")}
              </Label>
              <Popover
                open={openLocalePopover}
                onOpenChange={setOpenLocalePopover}
                className="p-0"
              >
                <PopoverTrigger
                  className="overflow-hidden"
                  aria-invalid={form.invalid("user.locale")}
                  asChild
                >
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "justify-between",
                      form.data.user.locale ? "" : "text-muted-foreground",
                    )}
                  >
                    <span className="flex max-w-[300px] items-center gap-2 truncate md:max-w-[400px] 2xl:max-w-[500px]">
                      {form.data.user.locale && (
                        <img
                          src={`https://react-circle-flags.pages.dev/language/${form.data.user.locale}.svg`}
                          className="size-3.5 rounded-xl"
                          alt={`flag-${form.data.user.locale}`}
                        />
                      )}
                      {form.data.user.locale
                        ? `${locales.find((item) => item.locale === form.data.user.locale)?.language_name} (${locales.find((item) => item.locale === form.data.user.locale)?.currency_code})`
                        : t("common:placeholders.select")}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="popover-content p-0">
                  <Command
                    className="p-0"
                    filter={(value, search, keywords) => {
                      const extendValue = value + " " + keywords.join(" ");
                      if (
                        extendValue.toLowerCase().includes(search.toLowerCase())
                      )
                        return 1;
                      return 0;
                    }}
                  >
                    <CommandInput
                      placeholder={`${t("common:labels.search")} ${t("common:labels.language")} & ${t("common:labels.currency")}...`}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {t("common:empty.no-data-found")}
                      </CommandEmpty>
                      {locales.map((locale, index) => (
                        <CommandItem
                          key={index}
                          value={locale.locale}
                          keywords={[
                            locale.language_name,
                            locale.currency_code,
                          ]}
                          className={
                            form.data.user.locale === locale.locale
                              ? "bg-muted"
                              : ""
                          }
                          onSelect={(currentValue) => {
                            form.setData("user", {
                              ...form.data.user,
                              locale: locale.locale,
                            });
                            form.forgetError("user.locale");
                            setOpenLocalePopover(false);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={`https://react-circle-flags.pages.dev/language/${locale.locale}.svg`}
                              className="size-3.5 rounded-xl"
                              alt={`flag-${locale.locale}`}
                            />
                            {locale.language_name} ({locale.currency_code})
                          </div>
                          <CheckIcon
                            className={cn(
                              "ml-auto h-4 w-4",
                              form.data.user.locale === locale.locale
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {form.invalid("user.locale") && (
                <InputError message={form.errors["user.locale"]} />
              )}
            </div>
            <small className="cursor-pointer font-medium">
              {t("auth:signup.cta.agreement-prefix")}
              <span
                className="text-primary underline-offset-4 hover:underline"
                onClick={() => setIsDialogOpened(true)}
              >
                {t("auth:signup.cta.agreement-link")}
              </span>
              {t("auth:signup.cta.agreement-suffix")}
            </small>
            <Button type="submit" className="w-full" disabled={form.processing}>
              {form.processing && (
                <Loading02Icon className="h-4 w-4 animate-spin" />
              )}
              {!form.processing
                ? t("auth:signup.button")
                : t("common:loading.please-wait")}
            </Button>
            <div className="text-center text-sm">
              {t("auth:signup.cta.signin-prefix")}{" "}
              <Link
                href={route("user.auth.signin")}
                className="text-primary font-medium underline underline-offset-4"
              >
                {t("auth:signup.cta.signin-link")}
              </Link>
            </div>
          </div>
        </form>
      </AuthLayout>
      <Transition appear show={isDialogOpened} as={Fragment}>
        <HeadlessDialog
          as="div"
          className="relative z-50"
          onClose={() => {}}
          static
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
          </TransitionChild>
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <HeadlessDialogPanel className="border-border/25 bg-secondary relative w-full translate-y-0 transform overflow-hidden !rounded-2xl border text-left shadow-xl transition-all sm:my-8 sm:max-w-3xl">
                  <div className="w-full">
                    <div className="prose prose-sm p-4 text-sm">
                      <h2 className="text-primary text-base font-semibold">
                        {t("auth:signup.cta.agreement-link")}
                      </h2>
                      {toHTML(pageProps.tos.content)}
                    </div>
                    <div className="dark:from-muted dark:to-muted/50 mt-4 flex w-full items-center justify-end gap-1 rounded-b-xl bg-gradient-to-b from-gray-200 to-gray-200/40 p-2 px-4">
                      <Button
                        size="sm"
                        onClick={() => {
                          setIsDialogOpened(false);
                        }}
                      >
                        {t("auth:signup.cta.agreement-button")}
                      </Button>
                    </div>
                  </div>
                </HeadlessDialogPanel>
              </TransitionChild>
            </div>
          </div>
        </HeadlessDialog>
      </Transition>
    </>
  );
}
