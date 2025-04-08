// Copyright © 2021 Aravinth Manivnanan <realaravinth@batsense.net>.
// SPDX-FileCopyrightText: 2023 Aravinth Manivannan <realaravinth@batsense.net>
//
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

import Receiver, {SiteKey} from "@mcaptcha/core-glue";

import { ID, INPUT_NAME, INPUT_LABEL_ID } from "./const";
class WidgetConfig {
  suffix?: string;
  siteKey?: SiteKey;
  widgetLink?: URL;
}

class Widget {
  inputElement: HTMLInputElement;
  receiver: Receiver;

  constructor(config: WidgetConfig) {
    this.receiver = new Receiver(config, this.setToken);
    this.receiver.listen();

    const suffix = config.suffix || '';
    const parentId = `${ID}${suffix}`;
    const inputId = `${INPUT_NAME}${suffix}`;
    const labelId = `${INPUT_LABEL_ID}${suffix}`;

    const parentElement = document.getElementById(parentId);

    if (parentElement === null || parentElement === undefined) {
      throw new Error(`Element ${inputId}'s parent element, ${parentId} is undefined`);
    }

    let label = <HTMLLabelElement | null>(
        document.getElementById(labelId)
    );

    if (label !== null) {
      label.style.display = "none";
    }

    this.inputElement = <HTMLInputElement>document.getElementById(inputId);

    this.inputElement.id = inputId;
    this.inputElement.name = inputId;
    this.inputElement.hidden = true;
    this.inputElement.required = true;
    this.inputElement.style.display = "none";
    parentElement.appendChild(this.inputElement);

    const iframe_id = `mcaptcha-widget__iframe${suffix}`;
    const iframe = document.createElement("iframe");
    iframe.title = "mCaptcha";
    iframe.src = this.receiver.widgetLink.toString();
    iframe.ariaRoleDescription = "presentation";
    iframe.name = iframe_id;
    iframe.id = iframe_id;
    iframe.scrolling = "no";
    try {
      (<any>iframe).sandbox = "allow-same-origin allow-scripts allow-popups";
    } catch {
      try {
        (<any>iframe).sandbox.add("allow-same-origin");
        (<any>iframe).sandbox.add("allow-scripts");
        (<any>iframe).sandbox.add("allow-popups");
      } catch {
        iframe.setAttribute(
            "sandbox",
            "allow-same-origin allow-scripts allow-popups"
        );
      }
    }
    iframe.width = "100%";
    iframe.height = "100%";
    iframe.frameBorder = "0";

    parentElement.appendChild(iframe);
  }

  /*
   * Set token value to a hidden input field in the form
   */
  setToken = (val: string) => (this.inputElement.value = val);
}

export const run = () => {
  const inputLabels = <HTMLElement[]>Array.from(document.querySelectorAll(`[id^=${INPUT_LABEL_ID}]:not([data-setup])`));

  for (const inputLabel of inputLabels) {
    const mcaptchaUrl = inputLabel.dataset.mcaptcha_url

    // Prevents duplicate widget setup if the <script>
    // tag is included multiple times on the page
    inputLabel.setAttribute('data-setup', 'true');

    if (mcaptchaUrl) {
      const config = {
        suffix: inputLabel.id.replace(INPUT_LABEL_ID, ''),
        widgetLink: new URL(mcaptchaUrl),
      };
      new Widget(config);
    } else {
      throw new Error(
          `Couldn't find "mcaptcha_url" dataset in element (ID=${inputLabel?.id || INPUT_LABEL_ID})`
      );
    }
  }
};


export default Widget;