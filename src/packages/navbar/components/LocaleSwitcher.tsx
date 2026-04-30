// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { ApplicationContext } from "@open-pioneer/runtime";
import { useIntl, useService } from "open-pioneer:react-hooks";
import {
    Select,
    FormLabel,
    FormControl
} from "@open-pioneer/chakra-integration";

const LocaleSwitcher: React.FC = () => {
    const intl = useIntl();
    const appCtx = useService<ApplicationContext>("runtime.ApplicationContext");
    const currentLocale = parseLocale(appCtx.getLocale());
    const locales = appCtx.getSupportedLocales();
    const changeLocale = (locale: string) => {
        switch (locale) {
            case "en":
                appCtx.setLocale("en");
                break;
            case "de":
                appCtx.setLocale("de");
                break;
            case "hu":
                appCtx.setLocale("hu");
                break;
            case "da":
                appCtx.setLocale("da");
                break;
        }
    };

    return (
        <FormControl>
            {/* <FormLabel textAlign="center">{intl.formatMessage({ id: "localeSwitcher.label" })}</FormLabel> */}
            <Select
                value={currentLocale}
                onChange={(e) => changeLocale(e.target.value)}
            >
                {locales.map((locale) => (
                    <option key={`locale-${locale}`} value={locale}>
                        {intl.formatMessage({ id: `localeSwitcher.locale.${locale}` })}
                    </option>
                ))}
            </Select>
        </FormControl>
    );
};

function parseLocale(locale: string) {
    const prefix = locale.match(/^[a-z]+/i)?.[0];
    if (prefix === "en" || prefix == "de" || prefix == "hu" || prefix == "da") {
        return prefix;
    }
    throw new Error("unexpected locale prefix: " + prefix);
}

export default LocaleSwitcher;