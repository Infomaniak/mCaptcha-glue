// Copyright © 2021 Aravinth Manivnanan <realaravinth@batsense.net>.
// SPDX-FileCopyrightText: 2023 Aravinth Manivannan <realaravinth@batsense.net>
//
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

import Receiver from "@mcaptcha/core-glue";

import {ID, INPUT_NAME} from "./const";

class Widget {
  inputElement: HTMLInputElement;
  receiver: Receiver;

  constructor(inputElement: HTMLInputElement) {
    const labelElement = inputElement?.parentElement;
    console.log(labelElement);

    if (!labelElement || !labelElement.dataset.mcaptcha_url) {
      throw new Error("Could not find the mcaptcha_url data");
    }

    this.receiver = new Receiver({
      widgetLink: new URL(labelElement.dataset.mcaptcha_url),
    }, this.setToken);

    this.receiver.listen();

    if (!labelElement.parentElement) {
      throw new Error("Captcha's parent element not found");
    }

    const containerElement = labelElement.parentElement.querySelector(`:scope > .${ID},:scope > #${ID}`)

    if (!containerElement) {
      throw new Error("Captcha's container element not found");
    }

    labelElement.style.display = "none";

    this.inputElement = inputElement

    this.inputElement.hidden = true;
    this.inputElement.required = true;
    this.inputElement.style.display = "none";

    containerElement.appendChild(this.inputElement);

    const iframe = document.createElement("iframe");
    iframe.title = "mCaptcha";
    iframe.src = this.receiver.widgetLink.toString();
    iframe.ariaRoleDescription = "presentation";
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

    containerElement.appendChild(iframe);
  }

  /*
   * Set token value to a hidden input field in the form
   */
  setToken = (val: string) => (this.inputElement.value = val);
}

export const run = () => {
  const inputs = <HTMLInputElement[]>Array.from(document.querySelectorAll(`input.${INPUT_NAME}:not([data-setup]), input#${INPUT_NAME}:not([data-setup])`));

  if (inputs.length === 0) {
    throw new Error("Could not find any mCaptcha to setup");
  }

  for (const input of inputs) {
    // Prevents duplicate widget setup if the <script>
    // tag is included multiple times on the page
    input.setAttribute('data-setup', 'true');
    new Widget(input);
  }
};


export default Widget;