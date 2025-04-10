// Copyright © 2021 Aravinth Manivnanan <realaravinth@batsense.net>.
// SPDX-FileCopyrightText: 2023 Aravinth Manivannan <realaravinth@batsense.net>
//
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

import { INPUT_NAME, ID } from "./const";
import Widget from "./widget";
import { run } from "./widget";

("use strict");

const widgetLink = new URL(
  "https://demo.mcaptcha.org/widget/?sitekey=idontexist"
);

beforeEach(() => {
  const container = document.createElement("div");

  const label = document.createElement("label");
  label.dataset.mcaptcha_url = widgetLink.toString();

  const input = document.createElement("input");
  input.classList.add(INPUT_NAME);
  label.appendChild(input);

  container.appendChild(label);

  const iframeContainer = document.createElement("div");
  iframeContainer.classList.add(ID);
  container.appendChild(iframeContainer);

  document.body.appendChild(container);
});


afterEach(() => {
  try {
    [
      document.querySelector("div"),
      document.querySelector("label"),
      document.querySelector("input"),
    ].forEach((element) => {
      if (element) {
        element.remove();
      }
    });
  } catch {}
});

it("Widget fails when mcaptcha__widget-container div is absent", () => {
  document.querySelector(`.${ID}`)?.remove();

  expect(() => {
    new Widget(<HTMLInputElement>document.querySelector(`.${INPUT_NAME}`));
  }).toThrow("Captcha's container element not found");
});

it("Widget throws if input is not inside a label with data-mcaptcha_url", () => {
  const input = document.createElement("input");
  input.classList.add(INPUT_NAME);
  document.body.appendChild(input);

  expect(() => new Widget(input)).toThrow("Could not find the mcaptcha_url data");

  input.remove();
});

it("Widget works", () => {
  const input = <HTMLInputElement>document.querySelector(`.${INPUT_NAME}`);
  const w = new Widget(input);
  const token = "token";
  w.setToken(token);
  expect(input.value).toBe(token);
});

it("message handler works", async () => {
  const input = <HTMLInputElement>document.querySelector(`.${INPUT_NAME}`);
  const w = new Widget(input);

  const token = ["foo", "bar"];
  token.forEach((t) => {
    let data = {
      data: {
        token: t,
      },
      origin: widgetLink.toString(),
    };
    let event = new MessageEvent("message", data);
    w.receiver.handle(event);
    if (!input) {
    }
    expect(input.value).toBe(t);

    data = {
      data: {
        token: `${t}2`,
      },
      origin: new URL("https://fake.example.com").toString(),
    };
    event = new MessageEvent("message", data);
    w.receiver.handle(event);
    expect(input.value).toBe(t);
  });
});

it("Widget runner works", () => {
  run();
});

it("Widget runner doesnt do anything when no", () => {
  expect(() => run()).not.toThrow();

  document.querySelector(`.${INPUT_NAME}`)?.remove();
  expect(() => run()).toThrow("Could not find any mCaptcha to setup");
});

it("Widget runner skips already initialized inputs", () => {
  const input = <HTMLInputElement>document.querySelector(`.${INPUT_NAME}`);
  input.setAttribute("data-setup", "true");

  expect(() => run()).toThrow("Could not find any mCaptcha to setup");
});

it("Widget hides input and label properly", () => {
  const input = <HTMLInputElement>document.querySelector(`.${INPUT_NAME}`);
  const label = input.parentElement as HTMLElement;
  new Widget(input);

  expect(input.hidden).toBe(true);
  expect(input.required).toBe(true);
  expect(input.style.display).toBe("none");
  expect(label.style.display).toBe("none");
});

it("Widget appends iframe to container", () => {
  const input = <HTMLInputElement>document.querySelector(`.${INPUT_NAME}`);
  new Widget(input);
  const iframe = document.querySelector("iframe");
  expect(iframe).toBeTruthy();
  expect(iframe?.src).toBe(widgetLink.toString());
});