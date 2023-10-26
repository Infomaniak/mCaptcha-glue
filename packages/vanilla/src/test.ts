/*
 * mCaptcha is a PoW based DoS protection software.
 * This is the frontend web component of the mCaptcha system
 * Copyright © 2021 Aravinth Manivnanan <realaravinth@batsense.net>.
 *
 * Use of this source code is governed by Apache 2.0 or MIT license.
 * You shoud have received a copy of MIT and Apache 2.0 along with
 * this program. If not, see <https://spdx.org/licenses/MIT.html> for
 * MIT or <http://www.apache.org/licenses/LICENSE-2.0> for Apache.
 */

import { INPUT_NAME, ID, INPUT_LABEL_ID } from "./const";
import Widget from "./widget";
import { run } from "./widget";

("use strict");

const widgetLink = new URL(
  "https://demo.mcaptcha.org/widget/?sitekey=idontexist"
);

beforeEach(() => {
  const label = document.createElement("label");
  label.id = INPUT_LABEL_ID;
  label.htmlFor = INPUT_NAME;
  label.dataset.mcaptcha_url = widgetLink.toString();

  const input = document.createElement("input");
  input.id = INPUT_NAME;
  label.appendChild(input);
  document.body.appendChild(label);

  const container = document.createElement("div");
  container.id = ID;
  document.body.appendChild(container);
});

afterEach(() => {
  console.log("removing div element");
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
  document.getElementById(ID)?.remove();
  try {
    new Widget({ widgetLink: new URL(widgetLink) });
  } catch (e) {
    expect((<Error>e).message).toContain(ID);
  }
});

it("Widget works", () => {
  const w = new Widget({ widgetLink: new URL(widgetLink) });
  const token = "token";
  w.setToken(token);
  const input = <HTMLInputElement>document.getElementById(INPUT_NAME);
  expect(input.value).toBe(token);
});

it("message handler works", async () => {
  const w = new Widget({ widgetLink: new URL(widgetLink) });
  let input = <HTMLInputElement>document.getElementById(INPUT_NAME);

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

it("Widget runner doesn't work when label is absent", () => {
  document.querySelector("label")?.remove();
  try {
    run();
  } catch (e) {
    expect((<Error>e).message).toContain(`Couldn't find "mcaptcha_url"`);
  }

  const label = document.createElement("label");
  label.id = INPUT_LABEL_ID;
  label.htmlFor = INPUT_NAME;
  document.body.appendChild(label);

  try {
    run();
  } catch (e) {
    expect((<Error>e).message).toContain(`Couldn't find "mcaptcha_url"`);
  }
});
