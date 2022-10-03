import React, { createElement, useState, useEffect, Fragment as Fragment$1 } from 'react';
import ReactDOM from 'react-dom/server';
import { escape } from 'html-escaper';
/* empty css                           *//* empty css                           *//* empty css                           */import * as $$module7 from 'react-icons/io5/index.js';
import { IoSunny, IoMoon, IoMenu, IoLogoGithub, IoArrowForward, IoChevronForward } from 'react-icons/io5/index.js';
import { jsx, jsxs } from 'react/jsx-runtime';
import { Menu, Transition } from '@headlessui/react';
import { doWork } from '@altano/tiny-async-pool';
import { dim, bold, red, yellow, cyan, green, bgGreen, black } from 'kleur/colors';
import fs from 'node:fs/promises';
import OS from 'node:os';
import path, { basename as basename$1, extname as extname$1, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import MagicString from 'magic-string';
import { Readable } from 'node:stream';
import slash from 'slash';
import sizeOf from 'image-size';
import mime from 'mime';
/* empty css                                        */
const $$module1$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	get warnForMissingAlt () { return warnForMissingAlt; },
	get Image () { return $$Image; },
	get Picture () { return $$Picture; }
}, Symbol.toStringTag, { value: 'Module' }));

/**
 * Astro passes `children` as a string of HTML, so we need
 * a wrapper `div` to render that content as VNodes.
 *
 * As a bonus, we can signal to React that this subtree is
 * entirely static and will never change via `shouldComponentUpdate`.
 */
const StaticHtml = ({ value, name }) => {
	if (!value) return null;
	return createElement('astro-slot', {
		name,
		suppressHydrationWarning: true,
		dangerouslySetInnerHTML: { __html: value },
	});
};

/**
 * This tells React to opt-out of re-rendering this subtree,
 * In addition to being a performance optimization,
 * this also allows other frameworks to attach to `children`.
 *
 * See https://preactjs.com/guide/v8/external-dom-mutations
 */
StaticHtml.shouldComponentUpdate = () => false;

const slotName$1 = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
const reactTypeof = Symbol.for('react.element');

function errorIsComingFromPreactComponent(err) {
	return (
		err.message &&
		(err.message.startsWith("Cannot read property '__H'") ||
			err.message.includes("(reading '__H')"))
	);
}

async function check$1(Component, props, children) {
	// Note: there are packages that do some unholy things to create "components".
	// Checking the $$typeof property catches most of these patterns.
	if (typeof Component === 'object') {
		const $$typeof = Component['$$typeof'];
		return $$typeof && $$typeof.toString().slice('Symbol('.length).startsWith('react');
	}
	if (typeof Component !== 'function') return false;

	if (Component.prototype != null && typeof Component.prototype.render === 'function') {
		return React.Component.isPrototypeOf(Component) || React.PureComponent.isPrototypeOf(Component);
	}

	let error = null;
	let isReactComponent = false;
	function Tester(...args) {
		try {
			const vnode = Component(...args);
			if (vnode && vnode['$$typeof'] === reactTypeof) {
				isReactComponent = true;
			}
		} catch (err) {
			if (!errorIsComingFromPreactComponent(err)) {
				error = err;
			}
		}

		return React.createElement('div');
	}

	await renderToStaticMarkup$1(Tester, props, children, {});

	if (error) {
		throw error;
	}
	return isReactComponent;
}

async function getNodeWritable() {
	let nodeStreamBuiltinModuleName = 'stream';
	let { Writable } = await import(/* @vite-ignore */ nodeStreamBuiltinModuleName);
	return Writable;
}

async function renderToStaticMarkup$1(Component, props, { default: children, ...slotted }, metadata) {
	delete props['class'];
	const slots = {};
	for (const [key, value] of Object.entries(slotted)) {
		const name = slotName$1(key);
		slots[name] = React.createElement(StaticHtml, { value, name });
	}
	// Note: create newProps to avoid mutating `props` before they are serialized
	const newProps = {
		...props,
		...slots,
	};
	if (children != null) {
		newProps.children = React.createElement(StaticHtml, { value: children });
	}
	const vnode = React.createElement(Component, newProps);
	let html;
	if (metadata && metadata.hydrate) {
		html = ReactDOM.renderToString(vnode);
		if ('renderToReadableStream' in ReactDOM) {
			html = await renderToReadableStreamAsync(vnode);
		} else {
			html = await renderToPipeableStreamAsync(vnode);
		}
	} else {
		if ('renderToReadableStream' in ReactDOM) {
			html = await renderToReadableStreamAsync(vnode);
		} else {
			html = await renderToStaticNodeStreamAsync(vnode);
		}
	}
	return { html };
}

async function renderToPipeableStreamAsync(vnode) {
	const Writable = await getNodeWritable();
	let html = '';
	return new Promise((resolve, reject) => {
		let error = undefined;
		let stream = ReactDOM.renderToPipeableStream(vnode, {
			onError(err) {
				error = err;
				reject(error);
			},
			onAllReady() {
				stream.pipe(
					new Writable({
						write(chunk, _encoding, callback) {
							html += chunk.toString('utf-8');
							callback();
						},
						destroy() {
							resolve(html);
						},
					})
				);
			},
		});
	});
}

async function renderToStaticNodeStreamAsync(vnode) {
	const Writable = await getNodeWritable();
	let html = '';
	return new Promise((resolve, reject) => {
		let stream = ReactDOM.renderToStaticNodeStream(vnode);
		stream.on('error', (err) => {
			reject(err);
		});
		stream.pipe(
			new Writable({
				write(chunk, _encoding, callback) {
					html += chunk.toString('utf-8');
					callback();
				},
				destroy() {
					resolve(html);
				},
			})
		);
	});
}

/**
 * Use a while loop instead of "for await" due to cloudflare and Vercel Edge issues
 * See https://github.com/facebook/react/issues/24169
 */
async function readResult(stream) {
	const reader = stream.getReader();
	let result = '';
	const decoder = new TextDecoder('utf-8');
	while (true) {
		const { done, value } = await reader.read();
		if (done) {
			if (value) {
				result += decoder.decode(value);
			} else {
				// This closes the decoder
				decoder.decode(new Uint8Array());
			}

			return result;
		}
		result += decoder.decode(value, { stream: true });
	}
}

async function renderToReadableStreamAsync(vnode) {
	return await readResult(await ReactDOM.renderToReadableStream(vnode));
}

const _renderer1 = {
	check: check$1,
	renderToStaticMarkup: renderToStaticMarkup$1,
};

const ASTRO_VERSION = "1.4.2";
function createDeprecatedFetchContentFn() {
  return () => {
    throw new Error("Deprecated: Astro.fetchContent() has been replaced with Astro.glob().");
  };
}
function createAstroGlobFn() {
  const globHandler = (importMetaGlobResult, globValue) => {
    let allEntries = [...Object.values(importMetaGlobResult)];
    if (allEntries.length === 0) {
      throw new Error(`Astro.glob(${JSON.stringify(globValue())}) - no matches found.`);
    }
    return Promise.all(allEntries.map((fn) => fn()));
  };
  return globHandler;
}
function createAstro(filePathname, _site, projectRootStr) {
  const site = _site ? new URL(_site) : void 0;
  const referenceURL = new URL(filePathname, `http://localhost`);
  const projectRoot = new URL(projectRootStr);
  return {
    site,
    generator: `Astro v${ASTRO_VERSION}`,
    fetchContent: createDeprecatedFetchContentFn(),
    glob: createAstroGlobFn(),
    resolve(...segments) {
      let resolved = segments.reduce((u, segment) => new URL(segment, u), referenceURL).pathname;
      if (resolved.startsWith(projectRoot.pathname)) {
        resolved = "/" + resolved.slice(projectRoot.pathname.length);
      }
      return resolved;
    }
  };
}

const escapeHTML = escape;
class HTMLString extends String {
  get [Symbol.toStringTag]() {
    return "HTMLString";
  }
}
const markHTMLString = (value) => {
  if (value instanceof HTMLString) {
    return value;
  }
  if (typeof value === "string") {
    return new HTMLString(value);
  }
  return value;
};

class Metadata {
  constructor(filePathname, opts) {
    this.modules = opts.modules;
    this.hoisted = opts.hoisted;
    this.hydratedComponents = opts.hydratedComponents;
    this.clientOnlyComponents = opts.clientOnlyComponents;
    this.hydrationDirectives = opts.hydrationDirectives;
    this.mockURL = new URL(filePathname, "http://example.com");
    this.metadataCache = /* @__PURE__ */ new Map();
  }
  resolvePath(specifier) {
    if (specifier.startsWith(".")) {
      const resolved = new URL(specifier, this.mockURL).pathname;
      if (resolved.startsWith("/@fs") && resolved.endsWith(".jsx")) {
        return resolved.slice(0, resolved.length - 4);
      }
      return resolved;
    }
    return specifier;
  }
  getPath(Component) {
    const metadata = this.getComponentMetadata(Component);
    return (metadata == null ? void 0 : metadata.componentUrl) || null;
  }
  getExport(Component) {
    const metadata = this.getComponentMetadata(Component);
    return (metadata == null ? void 0 : metadata.componentExport) || null;
  }
  getComponentMetadata(Component) {
    if (this.metadataCache.has(Component)) {
      return this.metadataCache.get(Component);
    }
    const metadata = this.findComponentMetadata(Component);
    this.metadataCache.set(Component, metadata);
    return metadata;
  }
  findComponentMetadata(Component) {
    const isCustomElement = typeof Component === "string";
    for (const { module, specifier } of this.modules) {
      const id = this.resolvePath(specifier);
      for (const [key, value] of Object.entries(module)) {
        if (isCustomElement) {
          if (key === "tagName" && Component === value) {
            return {
              componentExport: key,
              componentUrl: id
            };
          }
        } else if (Component === value) {
          return {
            componentExport: key,
            componentUrl: id
          };
        }
      }
    }
    return null;
  }
}
function createMetadata(filePathname, options) {
  return new Metadata(filePathname, options);
}

const PROP_TYPE = {
  Value: 0,
  JSON: 1,
  RegExp: 2,
  Date: 3,
  Map: 4,
  Set: 5,
  BigInt: 6,
  URL: 7,
  Uint8Array: 8,
  Uint16Array: 9,
  Uint32Array: 10
};
function serializeArray(value, metadata = {}, parents = /* @__PURE__ */ new WeakSet()) {
  if (parents.has(value)) {
    throw new Error(`Cyclic reference detected while serializing props for <${metadata.displayName} client:${metadata.hydrate}>!

Cyclic references cannot be safely serialized for client-side usage. Please remove the cyclic reference.`);
  }
  parents.add(value);
  const serialized = value.map((v) => {
    return convertToSerializedForm(v, metadata, parents);
  });
  parents.delete(value);
  return serialized;
}
function serializeObject(value, metadata = {}, parents = /* @__PURE__ */ new WeakSet()) {
  if (parents.has(value)) {
    throw new Error(`Cyclic reference detected while serializing props for <${metadata.displayName} client:${metadata.hydrate}>!

Cyclic references cannot be safely serialized for client-side usage. Please remove the cyclic reference.`);
  }
  parents.add(value);
  const serialized = Object.fromEntries(
    Object.entries(value).map(([k, v]) => {
      return [k, convertToSerializedForm(v, metadata, parents)];
    })
  );
  parents.delete(value);
  return serialized;
}
function convertToSerializedForm(value, metadata = {}, parents = /* @__PURE__ */ new WeakSet()) {
  const tag = Object.prototype.toString.call(value);
  switch (tag) {
    case "[object Date]": {
      return [PROP_TYPE.Date, value.toISOString()];
    }
    case "[object RegExp]": {
      return [PROP_TYPE.RegExp, value.source];
    }
    case "[object Map]": {
      return [
        PROP_TYPE.Map,
        JSON.stringify(serializeArray(Array.from(value), metadata, parents))
      ];
    }
    case "[object Set]": {
      return [
        PROP_TYPE.Set,
        JSON.stringify(serializeArray(Array.from(value), metadata, parents))
      ];
    }
    case "[object BigInt]": {
      return [PROP_TYPE.BigInt, value.toString()];
    }
    case "[object URL]": {
      return [PROP_TYPE.URL, value.toString()];
    }
    case "[object Array]": {
      return [PROP_TYPE.JSON, JSON.stringify(serializeArray(value, metadata, parents))];
    }
    case "[object Uint8Array]": {
      return [PROP_TYPE.Uint8Array, JSON.stringify(Array.from(value))];
    }
    case "[object Uint16Array]": {
      return [PROP_TYPE.Uint16Array, JSON.stringify(Array.from(value))];
    }
    case "[object Uint32Array]": {
      return [PROP_TYPE.Uint32Array, JSON.stringify(Array.from(value))];
    }
    default: {
      if (value !== null && typeof value === "object") {
        return [PROP_TYPE.Value, serializeObject(value, metadata, parents)];
      } else {
        return [PROP_TYPE.Value, value];
      }
    }
  }
}
function serializeProps(props, metadata) {
  const serialized = JSON.stringify(serializeObject(props, metadata));
  return serialized;
}

function serializeListValue(value) {
  const hash = {};
  push(value);
  return Object.keys(hash).join(" ");
  function push(item) {
    if (item && typeof item.forEach === "function")
      item.forEach(push);
    else if (item === Object(item))
      Object.keys(item).forEach((name) => {
        if (item[name])
          push(name);
      });
    else {
      item = item === false || item == null ? "" : String(item).trim();
      if (item) {
        item.split(/\s+/).forEach((name) => {
          hash[name] = true;
        });
      }
    }
  }
}

const HydrationDirectivesRaw = ["load", "idle", "media", "visible", "only"];
const HydrationDirectives = new Set(HydrationDirectivesRaw);
const HydrationDirectiveProps = new Set(HydrationDirectivesRaw.map((n) => `client:${n}`));
function extractDirectives(inputProps) {
  let extracted = {
    isPage: false,
    hydration: null,
    props: {}
  };
  for (const [key, value] of Object.entries(inputProps)) {
    if (key.startsWith("server:")) {
      if (key === "server:root") {
        extracted.isPage = true;
      }
    }
    if (key.startsWith("client:")) {
      if (!extracted.hydration) {
        extracted.hydration = {
          directive: "",
          value: "",
          componentUrl: "",
          componentExport: { value: "" }
        };
      }
      switch (key) {
        case "client:component-path": {
          extracted.hydration.componentUrl = value;
          break;
        }
        case "client:component-export": {
          extracted.hydration.componentExport.value = value;
          break;
        }
        case "client:component-hydration": {
          break;
        }
        case "client:display-name": {
          break;
        }
        default: {
          extracted.hydration.directive = key.split(":")[1];
          extracted.hydration.value = value;
          if (!HydrationDirectives.has(extracted.hydration.directive)) {
            throw new Error(
              `Error: invalid hydration directive "${key}". Supported hydration methods: ${Array.from(
                HydrationDirectiveProps
              ).join(", ")}`
            );
          }
          if (extracted.hydration.directive === "media" && typeof extracted.hydration.value !== "string") {
            throw new Error(
              'Error: Media query must be provided for "client:media", similar to client:media="(max-width: 600px)"'
            );
          }
          break;
        }
      }
    } else if (key === "class:list") {
      if (value) {
        extracted.props[key.slice(0, -5)] = serializeListValue(value);
      }
    } else {
      extracted.props[key] = value;
    }
  }
  return extracted;
}
async function generateHydrateScript(scriptOptions, metadata) {
  const { renderer, result, astroId, props, attrs } = scriptOptions;
  const { hydrate, componentUrl, componentExport } = metadata;
  if (!componentExport.value) {
    throw new Error(
      `Unable to resolve a valid export for "${metadata.displayName}"! Please open an issue at https://astro.build/issues!`
    );
  }
  const island = {
    children: "",
    props: {
      uid: astroId
    }
  };
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      island.props[key] = value;
    }
  }
  island.props["component-url"] = await result.resolve(decodeURI(componentUrl));
  if (renderer.clientEntrypoint) {
    island.props["component-export"] = componentExport.value;
    island.props["renderer-url"] = await result.resolve(decodeURI(renderer.clientEntrypoint));
    island.props["props"] = escapeHTML(serializeProps(props, metadata));
  }
  island.props["ssr"] = "";
  island.props["client"] = hydrate;
  let beforeHydrationUrl = await result.resolve("astro:scripts/before-hydration.js");
  if (beforeHydrationUrl.length) {
    island.props["before-hydration-url"] = beforeHydrationUrl;
  }
  island.props["opts"] = escapeHTML(
    JSON.stringify({
      name: metadata.displayName,
      value: metadata.hydrateArgs || ""
    })
  );
  return island;
}

class SlotString extends HTMLString {
  constructor(content, instructions) {
    super(content);
    this.instructions = instructions;
  }
}
async function renderSlot(_result, slotted, fallback) {
  if (slotted) {
    let iterator = renderChild(slotted);
    let content = "";
    let instructions = null;
    for await (const chunk of iterator) {
      if (chunk.type === "directive") {
        if (instructions === null) {
          instructions = [];
        }
        instructions.push(chunk);
      } else {
        content += chunk;
      }
    }
    return markHTMLString(new SlotString(content, instructions));
  }
  return fallback;
}
async function renderSlots(result, slots = {}) {
  let slotInstructions = null;
  let children = {};
  if (slots) {
    await Promise.all(
      Object.entries(slots).map(
        ([key, value]) => renderSlot(result, value).then((output) => {
          if (output.instructions) {
            if (slotInstructions === null) {
              slotInstructions = [];
            }
            slotInstructions.push(...output.instructions);
          }
          children[key] = output;
        })
      )
    );
  }
  return { slotInstructions, children };
}

async function* renderChild(child) {
  child = await child;
  if (child instanceof SlotString) {
    if (child.instructions) {
      yield* child.instructions;
    }
    yield child;
  } else if (child instanceof HTMLString) {
    yield child;
  } else if (Array.isArray(child)) {
    for (const value of child) {
      yield markHTMLString(await renderChild(value));
    }
  } else if (typeof child === "function") {
    yield* renderChild(child());
  } else if (typeof child === "string") {
    yield markHTMLString(escapeHTML(child));
  } else if (!child && child !== 0) ; else if (child instanceof AstroComponent || Object.prototype.toString.call(child) === "[object AstroComponent]") {
    yield* renderAstroComponent(child);
  } else if (ArrayBuffer.isView(child)) {
    yield child;
  } else if (typeof child === "object" && (Symbol.asyncIterator in child || Symbol.iterator in child)) {
    yield* child;
  } else {
    yield child;
  }
}

var idle_prebuilt_default = `(self.Astro=self.Astro||{}).idle=t=>{const e=async()=>{await(await t())()};"requestIdleCallback"in window?window.requestIdleCallback(e):setTimeout(e,200)},window.dispatchEvent(new Event("astro:idle"));`;

var load_prebuilt_default = `(self.Astro=self.Astro||{}).load=a=>{(async()=>await(await a())())()},window.dispatchEvent(new Event("astro:load"));`;

var media_prebuilt_default = `(self.Astro=self.Astro||{}).media=(s,a)=>{const t=async()=>{await(await s())()};if(a.value){const e=matchMedia(a.value);e.matches?t():e.addEventListener("change",t,{once:!0})}},window.dispatchEvent(new Event("astro:media"));`;

var only_prebuilt_default = `(self.Astro=self.Astro||{}).only=t=>{(async()=>await(await t())())()},window.dispatchEvent(new Event("astro:only"));`;

var visible_prebuilt_default = `(self.Astro=self.Astro||{}).visible=(s,c,n)=>{const r=async()=>{await(await s())()};let i=new IntersectionObserver(e=>{for(const t of e)if(!!t.isIntersecting){i.disconnect(),r();break}});for(let e=0;e<n.children.length;e++){const t=n.children[e];i.observe(t)}},window.dispatchEvent(new Event("astro:visible"));`;

var astro_island_prebuilt_default = `var l;{const c={0:t=>t,1:t=>JSON.parse(t,o),2:t=>new RegExp(t),3:t=>new Date(t),4:t=>new Map(JSON.parse(t,o)),5:t=>new Set(JSON.parse(t,o)),6:t=>BigInt(t),7:t=>new URL(t),8:t=>new Uint8Array(JSON.parse(t)),9:t=>new Uint16Array(JSON.parse(t)),10:t=>new Uint32Array(JSON.parse(t))},o=(t,s)=>{if(t===""||!Array.isArray(s))return s;const[e,n]=s;return e in c?c[e](n):void 0};customElements.get("astro-island")||customElements.define("astro-island",(l=class extends HTMLElement{constructor(){super(...arguments);this.hydrate=()=>{if(!this.hydrator||this.parentElement&&this.parentElement.closest("astro-island[ssr]"))return;const s=this.querySelectorAll("astro-slot"),e={},n=this.querySelectorAll("template[data-astro-template]");for(const r of n){const i=r.closest(this.tagName);!i||!i.isSameNode(this)||(e[r.getAttribute("data-astro-template")||"default"]=r.innerHTML,r.remove())}for(const r of s){const i=r.closest(this.tagName);!i||!i.isSameNode(this)||(e[r.getAttribute("name")||"default"]=r.innerHTML)}const a=this.hasAttribute("props")?JSON.parse(this.getAttribute("props"),o):{};this.hydrator(this)(this.Component,a,e,{client:this.getAttribute("client")}),this.removeAttribute("ssr"),window.removeEventListener("astro:hydrate",this.hydrate),window.dispatchEvent(new CustomEvent("astro:hydrate"))}}connectedCallback(){!this.hasAttribute("await-children")||this.firstChild?this.childrenConnectedCallback():new MutationObserver((s,e)=>{e.disconnect(),this.childrenConnectedCallback()}).observe(this,{childList:!0})}async childrenConnectedCallback(){window.addEventListener("astro:hydrate",this.hydrate);let s=this.getAttribute("before-hydration-url");s&&await import(s),this.start()}start(){const s=JSON.parse(this.getAttribute("opts")),e=this.getAttribute("client");if(Astro[e]===void 0){window.addEventListener(\`astro:\${e}\`,()=>this.start(),{once:!0});return}Astro[e](async()=>{const n=this.getAttribute("renderer-url"),[a,{default:r}]=await Promise.all([import(this.getAttribute("component-url")),n?import(n):()=>()=>{}]),i=this.getAttribute("component-export")||"default";if(!i.includes("."))this.Component=a[i];else{this.Component=a;for(const d of i.split("."))this.Component=this.Component[d]}return this.hydrator=r,this.hydrate},s,this)}attributeChangedCallback(){this.hydrator&&this.hydrate()}},l.observedAttributes=["props"],l))}`;

function determineIfNeedsHydrationScript(result) {
  if (result._metadata.hasHydrationScript) {
    return false;
  }
  return result._metadata.hasHydrationScript = true;
}
const hydrationScripts = {
  idle: idle_prebuilt_default,
  load: load_prebuilt_default,
  only: only_prebuilt_default,
  media: media_prebuilt_default,
  visible: visible_prebuilt_default
};
function determinesIfNeedsDirectiveScript(result, directive) {
  if (result._metadata.hasDirectives.has(directive)) {
    return false;
  }
  result._metadata.hasDirectives.add(directive);
  return true;
}
function getDirectiveScriptText(directive) {
  if (!(directive in hydrationScripts)) {
    throw new Error(`Unknown directive: ${directive}`);
  }
  const directiveScriptText = hydrationScripts[directive];
  return directiveScriptText;
}
function getPrescripts(type, directive) {
  switch (type) {
    case "both":
      return `<style>astro-island,astro-slot{display:contents}</style><script>${getDirectiveScriptText(directive) + astro_island_prebuilt_default}<\/script>`;
    case "directive":
      return `<script>${getDirectiveScriptText(directive)}<\/script>`;
  }
  return "";
}

const Fragment = Symbol.for("astro:fragment");
const Renderer = Symbol.for("astro:renderer");
const encoder = new TextEncoder();
const decoder = new TextDecoder();
function stringifyChunk(result, chunk) {
  switch (chunk.type) {
    case "directive": {
      const { hydration } = chunk;
      let needsHydrationScript = hydration && determineIfNeedsHydrationScript(result);
      let needsDirectiveScript = hydration && determinesIfNeedsDirectiveScript(result, hydration.directive);
      let prescriptType = needsHydrationScript ? "both" : needsDirectiveScript ? "directive" : null;
      if (prescriptType) {
        let prescripts = getPrescripts(prescriptType, hydration.directive);
        return markHTMLString(prescripts);
      } else {
        return "";
      }
    }
    default: {
      return chunk.toString();
    }
  }
}
class HTMLParts {
  constructor() {
    this.parts = [];
  }
  append(part, result) {
    if (ArrayBuffer.isView(part)) {
      this.parts.push(part);
    } else {
      this.parts.push(stringifyChunk(result, part));
    }
  }
  toString() {
    let html = "";
    for (const part of this.parts) {
      if (ArrayBuffer.isView(part)) {
        html += decoder.decode(part);
      } else {
        html += part;
      }
    }
    return html;
  }
  toArrayBuffer() {
    this.parts.forEach((part, i) => {
      if (!ArrayBuffer.isView(part)) {
        this.parts[i] = encoder.encode(String(part));
      }
    });
    return concatUint8Arrays(this.parts);
  }
}
function concatUint8Arrays(arrays) {
  let len = 0;
  arrays.forEach((arr) => len += arr.length);
  let merged = new Uint8Array(len);
  let offset = 0;
  arrays.forEach((arr) => {
    merged.set(arr, offset);
    offset += arr.length;
  });
  return merged;
}

function validateComponentProps(props, displayName) {
  var _a;
  if (((_a = (Object.assign({"BASE_URL":"/","MODE":"production","DEV":false,"PROD":true},{_:process.env._,}))) == null ? void 0 : _a.DEV) && props != null) {
    for (const prop of Object.keys(props)) {
      if (HydrationDirectiveProps.has(prop)) {
        console.warn(
          `You are attempting to render <${displayName} ${prop} />, but ${displayName} is an Astro component. Astro components do not render in the client and should not have a hydration directive. Please use a framework component for client rendering.`
        );
      }
    }
  }
}
class AstroComponent {
  constructor(htmlParts, expressions) {
    this.htmlParts = htmlParts;
    this.expressions = expressions;
  }
  get [Symbol.toStringTag]() {
    return "AstroComponent";
  }
  async *[Symbol.asyncIterator]() {
    const { htmlParts, expressions } = this;
    for (let i = 0; i < htmlParts.length; i++) {
      const html = htmlParts[i];
      const expression = expressions[i];
      yield markHTMLString(html);
      yield* renderChild(expression);
    }
  }
}
function isAstroComponent(obj) {
  return typeof obj === "object" && Object.prototype.toString.call(obj) === "[object AstroComponent]";
}
function isAstroComponentFactory(obj) {
  return obj == null ? false : !!obj.isAstroComponentFactory;
}
async function* renderAstroComponent(component) {
  for await (const value of component) {
    if (value || value === 0) {
      for await (const chunk of renderChild(value)) {
        switch (chunk.type) {
          case "directive": {
            yield chunk;
            break;
          }
          default: {
            yield markHTMLString(chunk);
            break;
          }
        }
      }
    }
  }
}
async function renderToString(result, componentFactory, props, children) {
  const Component = await componentFactory(result, props, children);
  if (!isAstroComponent(Component)) {
    const response = Component;
    throw response;
  }
  let parts = new HTMLParts();
  for await (const chunk of renderAstroComponent(Component)) {
    parts.append(chunk, result);
  }
  return parts.toString();
}
async function renderToIterable(result, componentFactory, displayName, props, children) {
  validateComponentProps(props, displayName);
  const Component = await componentFactory(result, props, children);
  if (!isAstroComponent(Component)) {
    console.warn(
      `Returning a Response is only supported inside of page components. Consider refactoring this logic into something like a function that can be used in the page.`
    );
    const response = Component;
    throw response;
  }
  return renderAstroComponent(Component);
}
async function renderTemplate(htmlParts, ...expressions) {
  return new AstroComponent(htmlParts, expressions);
}

/**
 * shortdash - https://github.com/bibig/node-shorthash
 *
 * @license
 *
 * (The MIT License)
 *
 * Copyright (c) 2013 Bibig <bibig@me.com>
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
const dictionary$1 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY";
const binary$1 = dictionary$1.length;
function bitwise$1(str) {
  let hash = 0;
  if (str.length === 0)
    return hash;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = (hash << 5) - hash + ch;
    hash = hash & hash;
  }
  return hash;
}
function shorthash$1(text) {
  let num;
  let result = "";
  let integer = bitwise$1(text);
  const sign = integer < 0 ? "Z" : "";
  integer = Math.abs(integer);
  while (integer >= binary$1) {
    num = integer % binary$1;
    integer = Math.floor(integer / binary$1);
    result = dictionary$1[num] + result;
  }
  if (integer > 0) {
    result = dictionary$1[integer] + result;
  }
  return sign + result;
}

const voidElementNames = /^(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i;
const htmlBooleanAttributes = /^(allowfullscreen|async|autofocus|autoplay|controls|default|defer|disabled|disablepictureinpicture|disableremoteplayback|formnovalidate|hidden|loop|nomodule|novalidate|open|playsinline|readonly|required|reversed|scoped|seamless|itemscope)$/i;
const htmlEnumAttributes = /^(contenteditable|draggable|spellcheck|value)$/i;
const svgEnumAttributes = /^(autoReverse|externalResourcesRequired|focusable|preserveAlpha)$/i;
const STATIC_DIRECTIVES = /* @__PURE__ */ new Set(["set:html", "set:text"]);
const toIdent = (k) => k.trim().replace(/(?:(?!^)\b\w|\s+|[^\w]+)/g, (match, index) => {
  if (/[^\w]|\s/.test(match))
    return "";
  return index === 0 ? match : match.toUpperCase();
});
const toAttributeString = (value, shouldEscape = true) => shouldEscape ? String(value).replace(/&/g, "&#38;").replace(/"/g, "&#34;") : value;
const kebab = (k) => k.toLowerCase() === k ? k : k.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
const toStyleString = (obj) => Object.entries(obj).map(([k, v]) => `${kebab(k)}:${v}`).join(";");
function defineScriptVars(vars) {
  let output = "";
  for (const [key, value] of Object.entries(vars)) {
    output += `const ${toIdent(key)} = ${JSON.stringify(value)};
`;
  }
  return markHTMLString(output);
}
function formatList(values) {
  if (values.length === 1) {
    return values[0];
  }
  return `${values.slice(0, -1).join(", ")} or ${values[values.length - 1]}`;
}
function addAttribute(value, key, shouldEscape = true) {
  if (value == null) {
    return "";
  }
  if (value === false) {
    if (htmlEnumAttributes.test(key) || svgEnumAttributes.test(key)) {
      return markHTMLString(` ${key}="false"`);
    }
    return "";
  }
  if (STATIC_DIRECTIVES.has(key)) {
    console.warn(`[astro] The "${key}" directive cannot be applied dynamically at runtime. It will not be rendered as an attribute.

Make sure to use the static attribute syntax (\`${key}={value}\`) instead of the dynamic spread syntax (\`{...{ "${key}": value }}\`).`);
    return "";
  }
  if (key === "class:list") {
    const listValue = toAttributeString(serializeListValue(value));
    if (listValue === "") {
      return "";
    }
    return markHTMLString(` ${key.slice(0, -5)}="${listValue}"`);
  }
  if (key === "style" && !(value instanceof HTMLString) && typeof value === "object") {
    return markHTMLString(` ${key}="${toStyleString(value)}"`);
  }
  if (key === "className") {
    return markHTMLString(` class="${toAttributeString(value, shouldEscape)}"`);
  }
  if (value === true && (key.startsWith("data-") || htmlBooleanAttributes.test(key))) {
    return markHTMLString(` ${key}`);
  } else {
    return markHTMLString(` ${key}="${toAttributeString(value, shouldEscape)}"`);
  }
}
function internalSpreadAttributes(values, shouldEscape = true) {
  let output = "";
  for (const [key, value] of Object.entries(values)) {
    output += addAttribute(value, key, shouldEscape);
  }
  return markHTMLString(output);
}
function renderElement$1(name, { props: _props, children = "" }, shouldEscape = true) {
  const { lang: _, "data-astro-id": astroId, "define:vars": defineVars, ...props } = _props;
  if (defineVars) {
    if (name === "style") {
      delete props["is:global"];
      delete props["is:scoped"];
    }
    if (name === "script") {
      delete props.hoist;
      children = defineScriptVars(defineVars) + "\n" + children;
    }
  }
  if ((children == null || children == "") && voidElementNames.test(name)) {
    return `<${name}${internalSpreadAttributes(props, shouldEscape)} />`;
  }
  return `<${name}${internalSpreadAttributes(props, shouldEscape)}>${children}</${name}>`;
}

function componentIsHTMLElement(Component) {
  return typeof HTMLElement !== "undefined" && HTMLElement.isPrototypeOf(Component);
}
async function renderHTMLElement(result, constructor, props, slots) {
  const name = getHTMLElementName(constructor);
  let attrHTML = "";
  for (const attr in props) {
    attrHTML += ` ${attr}="${toAttributeString(await props[attr])}"`;
  }
  return markHTMLString(
    `<${name}${attrHTML}>${await renderSlot(result, slots == null ? void 0 : slots.default)}</${name}>`
  );
}
function getHTMLElementName(constructor) {
  const definedName = customElements.getName(constructor);
  if (definedName)
    return definedName;
  const assignedName = constructor.name.replace(/^HTML|Element$/g, "").replace(/[A-Z]/g, "-$&").toLowerCase().replace(/^-/, "html-");
  return assignedName;
}

const rendererAliases = /* @__PURE__ */ new Map([["solid", "solid-js"]]);
function guessRenderers(componentUrl) {
  const extname = componentUrl == null ? void 0 : componentUrl.split(".").pop();
  switch (extname) {
    case "svelte":
      return ["@astrojs/svelte"];
    case "vue":
      return ["@astrojs/vue"];
    case "jsx":
    case "tsx":
      return ["@astrojs/react", "@astrojs/preact", "@astrojs/vue (jsx)"];
    default:
      return ["@astrojs/react", "@astrojs/preact", "@astrojs/vue", "@astrojs/svelte"];
  }
}
function getComponentType(Component) {
  if (Component === Fragment) {
    return "fragment";
  }
  if (Component && typeof Component === "object" && Component["astro:html"]) {
    return "html";
  }
  if (isAstroComponentFactory(Component)) {
    return "astro-factory";
  }
  return "unknown";
}
async function renderComponent(result, displayName, Component, _props, slots = {}) {
  var _a;
  Component = await Component;
  switch (getComponentType(Component)) {
    case "fragment": {
      const children2 = await renderSlot(result, slots == null ? void 0 : slots.default);
      if (children2 == null) {
        return children2;
      }
      return markHTMLString(children2);
    }
    case "html": {
      const { slotInstructions: slotInstructions2, children: children2 } = await renderSlots(result, slots);
      const html2 = Component.render({ slots: children2 });
      const hydrationHtml = slotInstructions2 ? slotInstructions2.map((instr) => stringifyChunk(result, instr)).join("") : "";
      return markHTMLString(hydrationHtml + html2);
    }
    case "astro-factory": {
      async function* renderAstroComponentInline() {
        let iterable = await renderToIterable(result, Component, displayName, _props, slots);
        yield* iterable;
      }
      return renderAstroComponentInline();
    }
  }
  if (!Component && !_props["client:only"]) {
    throw new Error(
      `Unable to render ${displayName} because it is ${Component}!
Did you forget to import the component or is it possible there is a typo?`
    );
  }
  const { renderers } = result._metadata;
  const metadata = { displayName };
  const { hydration, isPage, props } = extractDirectives(_props);
  let html = "";
  let attrs = void 0;
  if (hydration) {
    metadata.hydrate = hydration.directive;
    metadata.hydrateArgs = hydration.value;
    metadata.componentExport = hydration.componentExport;
    metadata.componentUrl = hydration.componentUrl;
  }
  const probableRendererNames = guessRenderers(metadata.componentUrl);
  if (Array.isArray(renderers) && renderers.length === 0 && typeof Component !== "string" && !componentIsHTMLElement(Component)) {
    const message = `Unable to render ${metadata.displayName}!

There are no \`integrations\` set in your \`astro.config.mjs\` file.
Did you mean to add ${formatList(probableRendererNames.map((r) => "`" + r + "`"))}?`;
    throw new Error(message);
  }
  const { children, slotInstructions } = await renderSlots(result, slots);
  let renderer;
  if (metadata.hydrate !== "only") {
    if (Component && Component[Renderer]) {
      const rendererName = Component[Renderer];
      renderer = renderers.find(({ name }) => name === rendererName);
    }
    if (!renderer) {
      let error;
      for (const r of renderers) {
        try {
          if (await r.ssr.check.call({ result }, Component, props, children)) {
            renderer = r;
            break;
          }
        } catch (e) {
          error ?? (error = e);
        }
      }
      if (!renderer && error) {
        throw error;
      }
    }
    if (!renderer && typeof HTMLElement === "function" && componentIsHTMLElement(Component)) {
      const output = renderHTMLElement(result, Component, _props, slots);
      return output;
    }
  } else {
    if (metadata.hydrateArgs) {
      const passedName = metadata.hydrateArgs;
      const rendererName = rendererAliases.has(passedName) ? rendererAliases.get(passedName) : passedName;
      renderer = renderers.find(
        ({ name }) => name === `@astrojs/${rendererName}` || name === rendererName
      );
    }
    if (!renderer && renderers.length === 1) {
      renderer = renderers[0];
    }
    if (!renderer) {
      const extname = (_a = metadata.componentUrl) == null ? void 0 : _a.split(".").pop();
      renderer = renderers.filter(
        ({ name }) => name === `@astrojs/${extname}` || name === extname
      )[0];
    }
  }
  if (!renderer) {
    if (metadata.hydrate === "only") {
      throw new Error(`Unable to render ${metadata.displayName}!

Using the \`client:only\` hydration strategy, Astro needs a hint to use the correct renderer.
Did you mean to pass <${metadata.displayName} client:only="${probableRendererNames.map((r) => r.replace("@astrojs/", "")).join("|")}" />
`);
    } else if (typeof Component !== "string") {
      const matchingRenderers = renderers.filter((r) => probableRendererNames.includes(r.name));
      const plural = renderers.length > 1;
      if (matchingRenderers.length === 0) {
        throw new Error(`Unable to render ${metadata.displayName}!

There ${plural ? "are" : "is"} ${renderers.length} renderer${plural ? "s" : ""} configured in your \`astro.config.mjs\` file,
but ${plural ? "none were" : "it was not"} able to server-side render ${metadata.displayName}.

Did you mean to enable ${formatList(probableRendererNames.map((r) => "`" + r + "`"))}?`);
      } else if (matchingRenderers.length === 1) {
        renderer = matchingRenderers[0];
        ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
          { result },
          Component,
          props,
          children,
          metadata
        ));
      } else {
        throw new Error(`Unable to render ${metadata.displayName}!

This component likely uses ${formatList(probableRendererNames)},
but Astro encountered an error during server-side rendering.

Please ensure that ${metadata.displayName}:
1. Does not unconditionally access browser-specific globals like \`window\` or \`document\`.
   If this is unavoidable, use the \`client:only\` hydration directive.
2. Does not conditionally return \`null\` or \`undefined\` when rendered on the server.

If you're still stuck, please open an issue on GitHub or join us at https://astro.build/chat.`);
      }
    }
  } else {
    if (metadata.hydrate === "only") {
      html = await renderSlot(result, slots == null ? void 0 : slots.fallback);
    } else {
      ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
        { result },
        Component,
        props,
        children,
        metadata
      ));
    }
  }
  if (renderer && !renderer.clientEntrypoint && renderer.name !== "@astrojs/lit" && metadata.hydrate) {
    throw new Error(
      `${metadata.displayName} component has a \`client:${metadata.hydrate}\` directive, but no client entrypoint was provided by ${renderer.name}!`
    );
  }
  if (!html && typeof Component === "string") {
    const childSlots = Object.values(children).join("");
    const iterable = renderAstroComponent(
      await renderTemplate`<${Component}${internalSpreadAttributes(props)}${markHTMLString(
        childSlots === "" && voidElementNames.test(Component) ? `/>` : `>${childSlots}</${Component}>`
      )}`
    );
    html = "";
    for await (const chunk of iterable) {
      html += chunk;
    }
  }
  if (!hydration) {
    if (isPage || (renderer == null ? void 0 : renderer.name) === "astro:jsx") {
      return html;
    }
    return markHTMLString(html.replace(/\<\/?astro-slot\>/g, ""));
  }
  const astroId = shorthash$1(
    `<!--${metadata.componentExport.value}:${metadata.componentUrl}-->
${html}
${serializeProps(
      props,
      metadata
    )}`
  );
  const island = await generateHydrateScript(
    { renderer, result, astroId, props, attrs },
    metadata
  );
  let unrenderedSlots = [];
  if (html) {
    if (Object.keys(children).length > 0) {
      for (const key of Object.keys(children)) {
        if (!html.includes(key === "default" ? `<astro-slot>` : `<astro-slot name="${key}">`)) {
          unrenderedSlots.push(key);
        }
      }
    }
  } else {
    unrenderedSlots = Object.keys(children);
  }
  const template = unrenderedSlots.length > 0 ? unrenderedSlots.map(
    (key) => `<template data-astro-template${key !== "default" ? `="${key}"` : ""}>${children[key]}</template>`
  ).join("") : "";
  island.children = `${html ?? ""}${template}`;
  if (island.children) {
    island.props["await-children"] = "";
  }
  async function* renderAll() {
    if (slotInstructions) {
      yield* slotInstructions;
    }
    yield { type: "directive", hydration, result };
    yield markHTMLString(renderElement$1("astro-island", island, false));
  }
  return renderAll();
}

const uniqueElements = (item, index, all) => {
  const props = JSON.stringify(item.props);
  const children = item.children;
  return index === all.findIndex((i) => JSON.stringify(i.props) === props && i.children == children);
};
function renderHead(result) {
  result._metadata.hasRenderedHead = true;
  const styles = Array.from(result.styles).filter(uniqueElements).map((style) => renderElement$1("style", style));
  result.styles.clear();
  const scripts = Array.from(result.scripts).filter(uniqueElements).map((script, i) => {
    return renderElement$1("script", script, false);
  });
  const links = Array.from(result.links).filter(uniqueElements).map((link) => renderElement$1("link", link, false));
  return markHTMLString(links.join("\n") + styles.join("\n") + scripts.join("\n"));
}
async function* maybeRenderHead(result) {
  if (result._metadata.hasRenderedHead) {
    return;
  }
  yield renderHead(result);
}

typeof process === "object" && Object.prototype.toString.call(process) === "[object process]";

function createComponent(cb) {
  cb.isAstroComponentFactory = true;
  return cb;
}
function __astro_tag_component__(Component, rendererName) {
  if (!Component)
    return;
  if (typeof Component !== "function")
    return;
  Object.defineProperty(Component, Renderer, {
    value: rendererName,
    enumerable: false,
    writable: false
  });
}
function spreadAttributes(values, _name, { class: scopedClassName } = {}) {
  let output = "";
  if (scopedClassName) {
    if (typeof values.class !== "undefined") {
      values.class += ` ${scopedClassName}`;
    } else if (typeof values["class:list"] !== "undefined") {
      values["class:list"] = [values["class:list"], scopedClassName];
    } else {
      values.class = scopedClassName;
    }
  }
  for (const [key, value] of Object.entries(values)) {
    output += addAttribute(value, key, true);
  }
  return markHTMLString(output);
}

const AstroJSX = "astro:jsx";
const Empty = Symbol("empty");
const toSlotName = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
function isVNode(vnode) {
  return vnode && typeof vnode === "object" && vnode[AstroJSX];
}
function transformSlots(vnode) {
  if (typeof vnode.type === "string")
    return vnode;
  const slots = {};
  if (isVNode(vnode.props.children)) {
    const child = vnode.props.children;
    if (!isVNode(child))
      return;
    if (!("slot" in child.props))
      return;
    const name = toSlotName(child.props.slot);
    slots[name] = [child];
    slots[name]["$$slot"] = true;
    delete child.props.slot;
    delete vnode.props.children;
  }
  if (Array.isArray(vnode.props.children)) {
    vnode.props.children = vnode.props.children.map((child) => {
      if (!isVNode(child))
        return child;
      if (!("slot" in child.props))
        return child;
      const name = toSlotName(child.props.slot);
      if (Array.isArray(slots[name])) {
        slots[name].push(child);
      } else {
        slots[name] = [child];
        slots[name]["$$slot"] = true;
      }
      delete child.props.slot;
      return Empty;
    }).filter((v) => v !== Empty);
  }
  Object.assign(vnode.props, slots);
}
function markRawChildren(child) {
  if (typeof child === "string")
    return markHTMLString(child);
  if (Array.isArray(child))
    return child.map((c) => markRawChildren(c));
  return child;
}
function transformSetDirectives(vnode) {
  if (!("set:html" in vnode.props || "set:text" in vnode.props))
    return;
  if ("set:html" in vnode.props) {
    const children = markRawChildren(vnode.props["set:html"]);
    delete vnode.props["set:html"];
    Object.assign(vnode.props, { children });
    return;
  }
  if ("set:text" in vnode.props) {
    const children = vnode.props["set:text"];
    delete vnode.props["set:text"];
    Object.assign(vnode.props, { children });
    return;
  }
}
function createVNode(type, props) {
  const vnode = {
    [Renderer]: "astro:jsx",
    [AstroJSX]: true,
    type,
    props: props ?? {}
  };
  transformSetDirectives(vnode);
  transformSlots(vnode);
  return vnode;
}

const ClientOnlyPlaceholder = "astro-client-only";
const skipAstroJSXCheck = /* @__PURE__ */ new WeakSet();
let originalConsoleError;
let consoleFilterRefs = 0;
async function renderJSX(result, vnode) {
  switch (true) {
    case vnode instanceof HTMLString:
      if (vnode.toString().trim() === "") {
        return "";
      }
      return vnode;
    case typeof vnode === "string":
      return markHTMLString(escapeHTML(vnode));
    case (!vnode && vnode !== 0):
      return "";
    case Array.isArray(vnode):
      return markHTMLString(
        (await Promise.all(vnode.map((v) => renderJSX(result, v)))).join("")
      );
  }
  if (isVNode(vnode)) {
    switch (true) {
      case !vnode.type: {
        throw new Error(`Unable to render ${result._metadata.pathname} because it contains an undefined Component!
Did you forget to import the component or is it possible there is a typo?`);
      }
      case vnode.type === Symbol.for("astro:fragment"):
        return renderJSX(result, vnode.props.children);
      case vnode.type.isAstroComponentFactory: {
        let props = {};
        let slots = {};
        for (const [key, value] of Object.entries(vnode.props ?? {})) {
          if (key === "children" || value && typeof value === "object" && value["$$slot"]) {
            slots[key === "children" ? "default" : key] = () => renderJSX(result, value);
          } else {
            props[key] = value;
          }
        }
        return markHTMLString(await renderToString(result, vnode.type, props, slots));
      }
      case (!vnode.type && vnode.type !== 0):
        return "";
      case (typeof vnode.type === "string" && vnode.type !== ClientOnlyPlaceholder):
        return markHTMLString(await renderElement(result, vnode.type, vnode.props ?? {}));
    }
    if (vnode.type) {
      let extractSlots2 = function(child) {
        if (Array.isArray(child)) {
          return child.map((c) => extractSlots2(c));
        }
        if (!isVNode(child)) {
          _slots.default.push(child);
          return;
        }
        if ("slot" in child.props) {
          _slots[child.props.slot] = [..._slots[child.props.slot] ?? [], child];
          delete child.props.slot;
          return;
        }
        _slots.default.push(child);
      };
      if (typeof vnode.type === "function" && vnode.type["astro:renderer"]) {
        skipAstroJSXCheck.add(vnode.type);
      }
      if (typeof vnode.type === "function" && vnode.props["server:root"]) {
        const output2 = await vnode.type(vnode.props ?? {});
        return await renderJSX(result, output2);
      }
      if (typeof vnode.type === "function" && !skipAstroJSXCheck.has(vnode.type)) {
        useConsoleFilter();
        try {
          const output2 = await vnode.type(vnode.props ?? {});
          if (output2 && output2[AstroJSX]) {
            return await renderJSX(result, output2);
          } else if (!output2) {
            return await renderJSX(result, output2);
          }
        } catch (e) {
          skipAstroJSXCheck.add(vnode.type);
        } finally {
          finishUsingConsoleFilter();
        }
      }
      const { children = null, ...props } = vnode.props ?? {};
      const _slots = {
        default: []
      };
      extractSlots2(children);
      for (const [key, value] of Object.entries(props)) {
        if (value["$$slot"]) {
          _slots[key] = value;
          delete props[key];
        }
      }
      const slotPromises = [];
      const slots = {};
      for (const [key, value] of Object.entries(_slots)) {
        slotPromises.push(
          renderJSX(result, value).then((output2) => {
            if (output2.toString().trim().length === 0)
              return;
            slots[key] = () => output2;
          })
        );
      }
      await Promise.all(slotPromises);
      let output;
      if (vnode.type === ClientOnlyPlaceholder && vnode.props["client:only"]) {
        output = await renderComponent(
          result,
          vnode.props["client:display-name"] ?? "",
          null,
          props,
          slots
        );
      } else {
        output = await renderComponent(
          result,
          typeof vnode.type === "function" ? vnode.type.name : vnode.type,
          vnode.type,
          props,
          slots
        );
      }
      if (typeof output !== "string" && Symbol.asyncIterator in output) {
        let parts = new HTMLParts();
        for await (const chunk of output) {
          parts.append(chunk, result);
        }
        return markHTMLString(parts.toString());
      } else {
        return markHTMLString(output);
      }
    }
  }
  return markHTMLString(`${vnode}`);
}
async function renderElement(result, tag, { children, ...props }) {
  return markHTMLString(
    `<${tag}${spreadAttributes(props)}${markHTMLString(
      (children == null || children == "") && voidElementNames.test(tag) ? `/>` : `>${children == null ? "" : await renderJSX(result, children)}</${tag}>`
    )}`
  );
}
function useConsoleFilter() {
  consoleFilterRefs++;
  if (!originalConsoleError) {
    originalConsoleError = console.error;
    try {
      console.error = filteredConsoleError;
    } catch (error) {
    }
  }
}
function finishUsingConsoleFilter() {
  consoleFilterRefs--;
}
function filteredConsoleError(msg, ...rest) {
  if (consoleFilterRefs > 0 && typeof msg === "string") {
    const isKnownReactHookError = msg.includes("Warning: Invalid hook call.") && msg.includes("https://reactjs.org/link/invalid-hook-call");
    if (isKnownReactHookError)
      return;
  }
  originalConsoleError(msg, ...rest);
}

const slotName = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
async function check(Component, props, { default: children = null, ...slotted } = {}) {
  if (typeof Component !== "function")
    return false;
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  try {
    const result = await Component({ ...props, ...slots, children });
    return result[AstroJSX];
  } catch (e) {
  }
  return false;
}
async function renderToStaticMarkup(Component, props = {}, { default: children = null, ...slotted } = {}) {
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  const { result } = this;
  const html = await renderJSX(result, createVNode(Component, { ...props, ...slots, children }));
  return { html };
}
var server_default = {
  check,
  renderToStaticMarkup
};

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$metadata$c = createMetadata("/@fs/var/www/bryanandjessicawills.com/html/src/components/BaseHead.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$f = createAstro("/@fs/var/www/bryanandjessicawills.com/html/src/components/BaseHead.astro", "https://www.bryanwills.dev/", "file:///var/www/bryanandjessicawills.com/html/");
const $$BaseHead = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$f, $$props, $$slots);
  Astro2.self = $$BaseHead;
  const { title, description, image = "/placeholder-social.jpg" } = Astro2.props;
  return renderTemplate(_a || (_a = __template(['<!-- Global Metadata --><meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<link rel="icon" type="image/svg+xml" href="/favicon.svg">\n<meta name="generator"', ">\n\n<!-- Primary Meta Tags -->\n<title>", '</title>\n<meta name="title"', '>\n<meta name="description"', '>\n\n<!-- Open Graph / Facebook -->\n<meta property="og:type" content="website">\n<meta property="og:url"', '>\n<meta property="og:title"', '>\n<meta property="og:description"', '>\n<meta property="og:image"', '>\n\n<!-- Twitter -->\n<meta property="twitter:card" content="summary_large_image">\n<meta property="twitter:url"', '>\n<meta property="twitter:title"', '>\n<meta property="twitter:description"', '>\n<meta property="twitter:image"', ">\n\n<script>\n  const theme = (() => {\n    if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {\n      return localStorage.getItem('theme')\n    }\n    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {\n      return 'dark'\n    }\n    return 'light'\n  })()\n  if (theme === 'light') {\n    document.documentElement.classList.remove('dark')\n  } else {\n    document.documentElement.classList.add('dark')\n  }\n<\/script>\n"])), addAttribute(Astro2.generator, "content"), title, addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(Astro2.url, "content"), addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(new URL(image, Astro2.url), "content"), addAttribute(Astro2.url, "content"), addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(new URL(image, Astro2.url), "content"));
});

const $$file$c = "/var/www/bryanandjessicawills.com/html/src/components/BaseHead.astro";
const $$url$c = undefined;

const $$module1$4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$c,
	default: $$BaseHead,
	file: $$file$c,
	url: $$url$c
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$b = createMetadata("/@fs/var/www/bryanandjessicawills.com/html/src/components/HeaderLink.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$e = createAstro("/@fs/var/www/bryanandjessicawills.com/html/src/components/HeaderLink.astro", "https://www.bryanwills.dev/", "file:///var/www/bryanandjessicawills.com/html/");
const $$HeaderLink = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$e, $$props, $$slots);
  Astro2.self = $$HeaderLink;
  const { href, class: className, ...props } = Astro2.props;
  const isActive = href === Astro2.url.pathname.replace(/\/$/, "");
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`${maybeRenderHead($$result)}<a${addAttribute(href, "href")}${addAttribute([[className, { active: isActive }], "astro-3EJL25VA"], "class:list")}${spreadAttributes(props)}>
	${renderSlot($$result, $$slots["default"])}
</a>
`;
});

const $$file$b = "/var/www/bryanandjessicawills.com/html/src/components/HeaderLink.astro";
const $$url$b = undefined;

const $$module1$3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$b,
	default: $$HeaderLink,
	file: $$file$b,
	url: $$url$b
}, Symbol.toStringTag, { value: 'Module' }));

const SITE_TITLE = "What I use - Bryan Wills";
const SITE_DESCRIPTION = "A curated list of the tech I use";
const HOMEPAGE_URL = "https://www.bryanwills.dev";

const $$module4$2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	SITE_TITLE,
	SITE_DESCRIPTION,
	HOMEPAGE_URL
}, Symbol.toStringTag, { value: 'Module' }));

const themes = ["light", "dark"];
function ThemeToggle() {
  const [isMounted, setIsMounted] = useState(false);
  const [theme, setTheme] = useState(() => {
    {
      return void 0;
    }
  });
  const toggleTheme = () => {
    const t = theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", t);
    setTheme(t);
  };
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
    }
  }, [theme]);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  return isMounted ? /* @__PURE__ */ jsx("div", {
    className: "inline-flex items-center p-[1px] rounded-3xl bg-orange-300 dark:bg-zinc-600",
    children: themes.map((t) => {
      const checked = t === theme;
      return /* @__PURE__ */ jsx("button", {
        className: `${checked ? "bg-white text-black" : ""} cursor-pointer rounded-3xl p-2`,
        onClick: toggleTheme,
        "aria-label": "Toggle theme",
        children: t === "light" ? /* @__PURE__ */ jsx(IoSunny, {}) : /* @__PURE__ */ jsx(IoMoon, {})
      }, t);
    })
  }) : /* @__PURE__ */ jsx("div", {});
}
__astro_tag_component__(ThemeToggle, "@astrojs/react");

const $$module4$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: ThemeToggle
}, Symbol.toStringTag, { value: 'Module' }));

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
function DropdownMenuItem({
  href,
  children
}) {
  return /* @__PURE__ */ jsx(Menu.Item, {
    children: ({
      active
    }) => /* @__PURE__ */ jsx("a", {
      href,
      className: classNames(active ? "bg-orange-200 dark:bg-zinc-700" : "", "block px-4 py-2 text-sm"),
      children
    })
  });
}
__astro_tag_component__(DropdownMenuItem, "@astrojs/react");

function DropdownMenu({
  tags
}) {
  return /* @__PURE__ */ jsxs(Menu, {
    as: "div",
    className: "relative inline-block text-left",
    children: [/* @__PURE__ */ jsx("div", {
      children: /* @__PURE__ */ jsx(Menu.Button, {
        className: "inline-flex justify-center rounded-md border border-zinc-400 dark:border-zinc-700 px-2 py-2 text-sm font-medium shadow-sm hover:bg-orange-200 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100 transition-all",
        "aria-label": "menu",
        children: /* @__PURE__ */ jsx(IoMenu, {
          className: "h-5 w-5"
        })
      })
    }), /* @__PURE__ */ jsx(Transition, {
      as: Fragment$1,
      enter: "transition ease-out duration-100",
      enterFrom: "transform opacity-0 scale-95",
      enterTo: "transform opacity-100 scale-100",
      leave: "transition ease-in duration-75",
      leaveFrom: "transform opacity-100 scale-100",
      leaveTo: "transform opacity-0 scale-95",
      children: /* @__PURE__ */ jsx(Menu.Items, {
        className: "absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md border border-zinc-400 dark:border-zinc-700 bg-orange-50 dark:bg-zinc-800 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none divide-zinc-400 dark:divide-zinc-700",
        children: /* @__PURE__ */ jsxs("div", {
          className: "py-1",
          children: [/* @__PURE__ */ jsx("div", {
            className: "px-3 py-2 uppercase font-bold text-xs",
            children: "Categories"
          }), tags.map((tag) => {
            return /* @__PURE__ */ jsx(DropdownMenuItem, {
              href: `/categories/${tag.toLowerCase()}`,
              children: tag
            }, tag);
          })]
        })
      })
    })]
  });
}
__astro_tag_component__(DropdownMenu, "@astrojs/react");

const $$module5$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: DropdownMenu
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$a = createMetadata("/@fs/var/www/bryanandjessicawills.com/html/src/components/Header.astro", { modules: [{ module: $$module1$3, specifier: "./HeaderLink.astro", assert: {} }, { module: $$module4$2, specifier: "../config", assert: {} }, { module: $$module7, specifier: "react-icons/io5/index.js", assert: {} }, { module: $$module4$1, specifier: "./ThemeToggleButton", assert: {} }, { module: $$module5$1, specifier: "./DropdownMenu", assert: {} }], hydratedComponents: [DropdownMenu, ThemeToggle], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set(["visible"]), hoisted: [] });
const $$Astro$d = createAstro("/@fs/var/www/bryanandjessicawills.com/html/src/components/Header.astro", "https://www.bryanwills.dev/", "file:///var/www/bryanandjessicawills.com/html/");
const $$Header = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$d, $$props, $$slots);
  Astro2.self = $$Header;
  const allPosts = await Astro2.glob(/* #__PURE__ */ Object.assign({"../pages/posts/keychron-k-2.md": () => Promise.resolve().then(() => _page2),"../pages/posts/keychron-q-1.md": () => Promise.resolve().then(() => _page3),"../pages/posts/macbook-air.md": () => Promise.resolve().then(() => _page4),"../pages/posts/macbook-pro.md": () => Promise.resolve().then(() => _page5)}), () => "../pages/posts/*.md");
  const allTags = /* @__PURE__ */ new Set();
  allPosts.map((post) => {
    post.frontmatter.tags && post.frontmatter.tags.map((tag) => allTags.add(tag));
  });
  return renderTemplate`${maybeRenderHead($$result)}<header class="fixed w-full p-2 z-20 backdrop-blur-md">
  <div class="mx-auto max-w-3xl">
    <nav class="flex items-center gap-3 text-base">
      <a href="/" class="group">
        <h2 class="font-semibold tracking-tighter p-2 font-mplus text-lg">
         Bryan Wills 
        </h2>
      </a>
      <div class="items-center gap-6 hidden md:flex">
        ${renderComponent($$result, "HeaderLink", $$HeaderLink, { "href": HOMEPAGE_URL }, { "default": () => renderTemplate`About` })}
        ${renderComponent($$result, "HeaderLink", $$HeaderLink, { "href": "https://github.com/bryanwills/bryan-uses", "target": "_blank" }, { "default": () => renderTemplate`${renderComponent($$result, "IoLogoGithub", IoLogoGithub, {})}Source` })}
      </div>
      <div class="flex-1"></div>
      ${renderComponent($$result, "ThemeToggle", ThemeToggle, { "client:visible": true, "client:component-hydration": "visible", "client:component-path": "/@fs/var/www/bryanandjessicawills.com/html/src/components/ThemeToggleButton", "client:component-export": "default" })}
      ${renderComponent($$result, "DropdownMenu", DropdownMenu, { "client:visible": true, "tags": Array.from(allTags), "client:component-hydration": "visible", "client:component-path": "/@fs/var/www/bryanandjessicawills.com/html/src/components/DropdownMenu", "client:component-export": "default" })}
    </nav>
  </div>
</header>`;
});

const $$file$a = "/var/www/bryanandjessicawills.com/html/src/components/Header.astro";
const $$url$a = undefined;

const $$module2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$a,
	default: $$Header,
	file: $$file$a,
	url: $$url$a
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$9 = createMetadata("/@fs/var/www/bryanandjessicawills.com/html/src/components/Footer.astro", { modules: [{ module: $$module4$2, specifier: "../config", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$c = createAstro("/@fs/var/www/bryanandjessicawills.com/html/src/components/Footer.astro", "https://www.bryanwills.dev/", "file:///var/www/bryanandjessicawills.com/html/");
const $$Footer = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$c, $$props, $$slots);
  Astro2.self = $$Footer;
  const today = new Date();
  return renderTemplate`${maybeRenderHead($$result)}<footer class="text-zinc-500 p-4 text-center">
  &copy; ${today.getFullYear()} <a${addAttribute(HOMEPAGE_URL, "href")}>Bryan Wills</a>. All rights reserved.
</footer>`;
});

const $$file$9 = "/var/www/bryanandjessicawills.com/html/src/components/Footer.astro";
const $$url$9 = undefined;

const $$module3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$9,
	default: $$Footer,
	file: $$file$9,
	url: $$url$9
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$8 = createMetadata("/@fs/var/www/bryanandjessicawills.com/html/src/components/Body.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$b = createAstro("/@fs/var/www/bryanandjessicawills.com/html/src/components/Body.astro", "https://www.bryanwills.dev/", "file:///var/www/bryanandjessicawills.com/html/");
const $$Body = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$b, $$props, $$slots);
  Astro2.self = $$Body;
  return renderTemplate`${maybeRenderHead($$result)}<body class="bg-orange-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-300 break-words leading-6 transition-colors duration-500">
  ${renderSlot($$result, $$slots["default"])}
</body>`;
});

const $$file$8 = "/var/www/bryanandjessicawills.com/html/src/components/Body.astro";
const $$url$8 = undefined;

const $$module5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$8,
	default: $$Body,
	file: $$file$8,
	url: $$url$8
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$7 = createMetadata("/@fs/var/www/bryanandjessicawills.com/html/src/components/Content.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$a = createAstro("/@fs/var/www/bryanandjessicawills.com/html/src/components/Content.astro", "https://www.bryanwills.dev/", "file:///var/www/bryanandjessicawills.com/html/");
const $$Content = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$a, $$props, $$slots);
  Astro2.self = $$Content;
  const { className = "" } = Astro2.props;
  return renderTemplate`${maybeRenderHead($$result)}<article${addAttribute(`px-8 mx-auto max-w-3xl ${className}`, "class")}>${renderSlot($$result, $$slots["default"])}</article>`;
});

const $$file$7 = "/var/www/bryanandjessicawills.com/html/src/components/Content.astro";
const $$url$7 = undefined;

const $$module6 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$7,
	default: $$Content,
	file: $$file$7,
	url: $$url$7
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$6 = createMetadata("/@fs/var/www/bryanandjessicawills.com/html/src/components/Masthead.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$9 = createAstro("/@fs/var/www/bryanandjessicawills.com/html/src/components/Masthead.astro", "https://www.bryanwills.dev/", "file:///var/www/bryanandjessicawills.com/html/");
const $$Masthead = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$9, $$props, $$slots);
  Astro2.self = $$Masthead;
  return renderTemplate`${maybeRenderHead($$result)}<section class="relative mb-6 h-80 flex justify-center items-center">
  <div class="absolute w-full h-full overflow-hidden">
    <video><source src="/masthead.webm" type="video/webm; codecs=vp9"></video>
  </div>
  <div class="z-10 text-center px-8 drop-shadow-lg shadow-black">
    <div class="uppercase text-sm mb-4">Welcome to</div>
    <div class="text-4xl font-mplus font-medium">A curated list of the tech I <span class="text-orange-500">use</span></div>
  </div>
</section>`;
});

const $$file$6 = "/var/www/bryanandjessicawills.com/html/src/components/Masthead.astro";
const $$url$6 = undefined;

const $$module8 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$6,
	default: $$Masthead,
	file: $$file$6,
	url: $$url$6
}, Symbol.toStringTag, { value: 'Module' }));

const PREFIX = "@astrojs/image";
const dateTimeFormat = new Intl.DateTimeFormat([], {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit"
});
const levels = {
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  silent: 90
};
function getPrefix(level, timestamp) {
  let prefix = "";
  if (timestamp) {
    prefix += dim(dateTimeFormat.format(new Date()) + " ");
  }
  switch (level) {
    case "debug":
      prefix += bold(green(`[${PREFIX}] `));
      break;
    case "info":
      prefix += bold(cyan(`[${PREFIX}] `));
      break;
    case "warn":
      prefix += bold(yellow(`[${PREFIX}] `));
      break;
    case "error":
      prefix += bold(red(`[${PREFIX}] `));
      break;
  }
  return prefix;
}
const log = (_level, dest) => ({ message, level, prefix = true, timestamp = true }) => {
  if (levels[_level] >= levels[level]) {
    dest(`${prefix ? getPrefix(level, timestamp) : ""}${message}`);
  }
};
const info = log("info", console.info);
const debug = log("debug", console.debug);
const warn = log("warn", console.warn);
const error = log("error", console.error);

/**
 * shortdash - https://github.com/bibig/node-shorthash
 *
 * @license
 *
 * (The MIT License)
 *
 * Copyright (c) 2013 Bibig <bibig@me.com>
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
const dictionary = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY";
const binary = dictionary.length;
function bitwise(str) {
  let hash = 0;
  if (str.length === 0)
    return hash;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = (hash << 5) - hash + ch;
    hash = hash & hash;
  }
  return hash;
}
function shorthash(text) {
  let num;
  let result = "";
  let integer = bitwise(text);
  const sign = integer < 0 ? "Z" : "";
  integer = Math.abs(integer);
  while (integer >= binary) {
    num = integer % binary;
    integer = Math.floor(integer / binary);
    result = dictionary[num] + result;
  }
  if (integer > 0) {
    result = dictionary[integer] + result;
  }
  return sign + result;
}

function isRemoteImage(src) {
  return /^http(s?):\/\//.test(src);
}
function removeQueryString(src) {
  const index = src.lastIndexOf("?");
  return index > 0 ? src.substring(0, index) : src;
}
function extname(src) {
  const base = basename(src);
  const index = base.lastIndexOf(".");
  if (index <= 0) {
    return "";
  }
  return src.substring(src.length - (base.length - index));
}
function removeExtname(src) {
  const index = src.lastIndexOf(".");
  if (index <= 0) {
    return src;
  }
  return src.substring(0, index);
}
function basename(src) {
  return src.replace(/^.*[\\\/]/, "");
}
function propsToFilename(transform) {
  let filename = removeQueryString(transform.src);
  filename = basename(filename);
  const ext = extname(filename);
  filename = removeExtname(filename);
  const outputExt = transform.format ? `.${transform.format}` : ext;
  return `/${filename}_${shorthash(JSON.stringify(transform))}${outputExt}`;
}
function prependForwardSlash(path) {
  return path[0] === "/" ? path : "/" + path;
}
function trimSlashes(path) {
  return path.replace(/^\/|\/$/g, "");
}
function isString(path) {
  return typeof path === "string" || path instanceof String;
}
function joinPaths(...paths) {
  return paths.filter(isString).map(trimSlashes).join("/");
}

async function loadLocalImage(src) {
  try {
    return await fs.readFile(src);
  } catch {
    return void 0;
  }
}
async function loadRemoteImage(src) {
  try {
    const res = await fetch(src);
    if (!res.ok) {
      return void 0;
    }
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return void 0;
  }
}
function getTimeStat(timeStart, timeEnd) {
  const buildTime = timeEnd - timeStart;
  return buildTime < 750 ? `${Math.round(buildTime)}ms` : `${(buildTime / 1e3).toFixed(2)}s`;
}
async function ssgBuild({ loader, staticImages, config, outDir, logLevel }) {
  const timer = performance.now();
  const cpuCount = OS.cpus().length;
  info({
    level: logLevel,
    prefix: false,
    message: `${bgGreen(
      black(
        ` optimizing ${staticImages.size} image${staticImages.size > 1 ? "s" : ""} in batches of ${cpuCount} `
      )
    )}`
  });
  async function processStaticImage([src, transformsMap]) {
    let inputFile = void 0;
    let inputBuffer = void 0;
    if (config.base && src.startsWith(config.base)) {
      src = src.substring(config.base.length - 1);
    }
    if (isRemoteImage(src)) {
      inputBuffer = await loadRemoteImage(src);
    } else {
      const inputFileURL = new URL(`.${src}`, outDir);
      inputFile = fileURLToPath(inputFileURL);
      inputBuffer = await loadLocalImage(inputFile);
    }
    if (!inputBuffer) {
      warn({ level: logLevel, message: `"${src}" image could not be fetched` });
      return;
    }
    const transforms = Array.from(transformsMap.entries());
    debug({ level: logLevel, prefix: false, message: `${green("\u25B6")} transforming ${src}` });
    let timeStart = performance.now();
    for (const [filename, transform] of transforms) {
      timeStart = performance.now();
      let outputFile;
      if (isRemoteImage(src)) {
        const outputFileURL = new URL(path.join("./assets", path.basename(filename)), outDir);
        outputFile = fileURLToPath(outputFileURL);
      } else {
        const outputFileURL = new URL(path.join("./assets", filename), outDir);
        outputFile = fileURLToPath(outputFileURL);
      }
      const { data } = await loader.transform(inputBuffer, transform);
      await fs.writeFile(outputFile, data);
      const timeEnd = performance.now();
      const timeChange = getTimeStat(timeStart, timeEnd);
      const timeIncrease = `(+${timeChange})`;
      const pathRelative = outputFile.replace(fileURLToPath(outDir), "");
      debug({
        level: logLevel,
        prefix: false,
        message: `  ${cyan("created")} ${dim(pathRelative)} ${dim(timeIncrease)}`
      });
    }
  }
  await doWork(cpuCount, staticImages, processStaticImage);
  info({
    level: logLevel,
    prefix: false,
    message: dim(`Completed in ${getTimeStat(timer, performance.now())}.
`)
  });
}

async function copyWasmFiles(dir) {
  const src = new URL("./", import.meta.url);
  await copyDir(fileURLToPath(src), fileURLToPath(dir));
}
async function copyDir(src, dest) {
  const itemNames = await fs.readdir(src);
  await Promise.all(itemNames.map(async (srcName) => {
    const srcPath = path.join(src, srcName);
    const destPath = path.join(dest, srcName);
    const s = await fs.stat(srcPath);
    if (s.isFile() && /.wasm$/.test(srcPath)) {
      await fs.mkdir(path.dirname(destPath), { recursive: true });
      await fs.copyFile(srcPath, destPath);
    } else if (s.isDirectory()) {
      await copyDir(srcPath, destPath);
    }
  }));
}

async function metadata(src, data) {
  const file = data || await fs.readFile(src);
  const { width, height, type, orientation } = await sizeOf(file);
  const isPortrait = (orientation || 0) >= 5;
  if (!width || !height || !type) {
    return void 0;
  }
  return {
    src: fileURLToPath(src),
    width: isPortrait ? height : width,
    height: isPortrait ? width : height,
    format: type,
    orientation
  };
}

function createPlugin(config, options) {
  const filter = (id) => /^(?!\/_image?).*.(heic|heif|avif|jpeg|jpg|png|tiff|webp|gif)$/.test(id);
  const virtualModuleId = "virtual:image-loader";
  let resolvedConfig;
  return {
    name: "@astrojs/image",
    enforce: "pre",
    configResolved(viteConfig) {
      resolvedConfig = viteConfig;
    },
    async resolveId(id) {
      if (id === virtualModuleId) {
        return await this.resolve(options.serviceEntryPoint);
      }
    },
    async load(id) {
      if (!filter(id)) {
        return null;
      }
      const url = pathToFileURL(id);
      const meta = await metadata(url);
      if (!meta) {
        return;
      }
      if (!this.meta.watchMode) {
        const pathname = decodeURI(url.pathname);
        const filename = basename$1(pathname, extname$1(pathname) + `.${meta.format}`);
        const handle = this.emitFile({
          name: filename,
          source: await fs.readFile(url),
          type: "asset"
        });
        meta.src = `__ASTRO_IMAGE_ASSET__${handle}__`;
      } else {
        const relId = path.relative(fileURLToPath(config.srcDir), id);
        meta.src = join("/@astroimage", relId);
        meta.src = slash(meta.src);
      }
      return `export default ${JSON.stringify(meta)}`;
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        var _a;
        if ((_a = req.url) == null ? void 0 : _a.startsWith("/@astroimage/")) {
          const [, id] = req.url.split("/@astroimage/");
          const url = new URL(id, config.srcDir);
          const file = await fs.readFile(url);
          const meta = await metadata(url);
          if (!meta) {
            return next();
          }
          const transform = await globalThis.astroImage.defaultLoader.parseTransform(
            url.searchParams
          );
          if (!transform) {
            return next();
          }
          const result = await globalThis.astroImage.defaultLoader.transform(file, transform);
          res.setHeader("Content-Type", `image/${result.format}`);
          res.setHeader("Cache-Control", "max-age=360000");
          const stream = Readable.from(result.data);
          return stream.pipe(res);
        }
        return next();
      });
    },
    async renderChunk(code) {
      const assetUrlRE = /__ASTRO_IMAGE_ASSET__([a-z\d]{8})__(?:_(.*?)__)?/g;
      let match;
      let s;
      while (match = assetUrlRE.exec(code)) {
        s = s || (s = new MagicString(code));
        const [full, hash, postfix = ""] = match;
        const file = this.getFileName(hash);
        const outputFilepath = resolvedConfig.base + file + postfix;
        s.overwrite(match.index, match.index + full.length, outputFilepath);
      }
      if (s) {
        return {
          code: s.toString(),
          map: resolvedConfig.build.sourcemap ? s.generateMap({ hires: true }) : null
        };
      } else {
        return null;
      }
    }
  };
}

function isOutputFormat(value) {
  return ["avif", "jpeg", "jpg", "png", "webp"].includes(value);
}
function isOutputFormatSupportsAlpha(value) {
  return ["avif", "png", "webp"].includes(value);
}
function isAspectRatioString(value) {
  return /^\d*:\d*$/.test(value);
}
function parseAspectRatio(aspectRatio) {
  if (!aspectRatio) {
    return void 0;
  }
  if (typeof aspectRatio === "number") {
    return aspectRatio;
  } else {
    const [width, height] = aspectRatio.split(":");
    return parseInt(width) / parseInt(height);
  }
}
function isSSRService(service) {
  return "transform" in service;
}
class BaseSSRService {
  async getImageAttributes(transform) {
    const { width, height, src, format, quality, aspectRatio, ...rest } = transform;
    return {
      ...rest,
      width,
      height
    };
  }
  serializeTransform(transform) {
    const searchParams = new URLSearchParams();
    if (transform.quality) {
      searchParams.append("q", transform.quality.toString());
    }
    if (transform.format) {
      searchParams.append("f", transform.format);
    }
    if (transform.width) {
      searchParams.append("w", transform.width.toString());
    }
    if (transform.height) {
      searchParams.append("h", transform.height.toString());
    }
    if (transform.aspectRatio) {
      searchParams.append("ar", transform.aspectRatio.toString());
    }
    if (transform.fit) {
      searchParams.append("fit", transform.fit);
    }
    if (transform.background) {
      searchParams.append("bg", transform.background);
    }
    if (transform.position) {
      searchParams.append("p", encodeURI(transform.position));
    }
    searchParams.append("href", transform.src);
    return { searchParams };
  }
  parseTransform(searchParams) {
    if (!searchParams.has("href")) {
      return void 0;
    }
    let transform = { src: searchParams.get("href") };
    if (searchParams.has("q")) {
      transform.quality = parseInt(searchParams.get("q"));
    }
    if (searchParams.has("f")) {
      const format = searchParams.get("f");
      if (isOutputFormat(format)) {
        transform.format = format;
      }
    }
    if (searchParams.has("w")) {
      transform.width = parseInt(searchParams.get("w"));
    }
    if (searchParams.has("h")) {
      transform.height = parseInt(searchParams.get("h"));
    }
    if (searchParams.has("ar")) {
      const ratio = searchParams.get("ar");
      if (isAspectRatioString(ratio)) {
        transform.aspectRatio = ratio;
      } else {
        transform.aspectRatio = parseFloat(ratio);
      }
    }
    if (searchParams.has("fit")) {
      transform.fit = searchParams.get("fit");
    }
    if (searchParams.has("p")) {
      transform.position = decodeURI(searchParams.get("p"));
    }
    if (searchParams.has("bg")) {
      transform.background = searchParams.get("bg");
    }
    return transform;
  }
}

function resolveSize(transform) {
  if (transform.width && transform.height) {
    return transform;
  }
  if (!transform.width && !transform.height) {
    throw new Error(`"width" and "height" cannot both be undefined`);
  }
  if (!transform.aspectRatio) {
    throw new Error(
      `"aspectRatio" must be included if only "${transform.width ? "width" : "height"}" is provided`
    );
  }
  let aspectRatio;
  if (typeof transform.aspectRatio === "number") {
    aspectRatio = transform.aspectRatio;
  } else {
    const [width, height] = transform.aspectRatio.split(":");
    aspectRatio = Number.parseInt(width) / Number.parseInt(height);
  }
  if (transform.width) {
    return {
      ...transform,
      width: transform.width,
      height: Math.round(transform.width / aspectRatio)
    };
  } else if (transform.height) {
    return {
      ...transform,
      width: Math.round(transform.height * aspectRatio),
      height: transform.height
    };
  }
  return transform;
}
async function resolveTransform(input) {
  if (typeof input.src === "string") {
    return resolveSize(input);
  }
  const metadata = "then" in input.src ? (await input.src).default : input.src;
  let { width, height, aspectRatio, background, format = metadata.format, ...rest } = input;
  if (!width && !height) {
    width = metadata.width;
    height = metadata.height;
  } else if (width) {
    let ratio = parseAspectRatio(aspectRatio) || metadata.width / metadata.height;
    height = height || Math.round(width / ratio);
  } else if (height) {
    let ratio = parseAspectRatio(aspectRatio) || metadata.width / metadata.height;
    width = width || Math.round(height * ratio);
  }
  return {
    ...rest,
    src: metadata.src,
    width,
    height,
    aspectRatio,
    format,
    background
  };
}
async function getImage(transform) {
  var _a, _b, _c;
  if (!transform.src) {
    throw new Error("[@astrojs/image] `src` is required");
  }
  let loader = (_a = globalThis.astroImage) == null ? void 0 : _a.loader;
  if (!loader) {
    const { default: mod } = await import('./chunks/squoosh.d7a3d731.mjs').catch(() => {
      throw new Error(
        "[@astrojs/image] Builtin image loader not found. (Did you remember to add the integration to your Astro config?)"
      );
    });
    loader = mod;
    globalThis.astroImage = globalThis.astroImage || {};
    globalThis.astroImage.loader = loader;
  }
  const resolved = await resolveTransform(transform);
  const attributes = await loader.getImageAttributes(resolved);
  const isDev = (_b = (Object.assign({"BASE_URL":"/","MODE":"production","DEV":false,"PROD":true},{_:process.env._,SSR:true,}))) == null ? void 0 : _b.DEV;
  const isLocalImage = !isRemoteImage(resolved.src);
  const _loader = isDev && isLocalImage ? globalThis.astroImage.defaultLoader : loader;
  if (!_loader) {
    throw new Error("@astrojs/image: loader not found!");
  }
  const { searchParams } = isSSRService(_loader) ? _loader.serializeTransform(resolved) : globalThis.astroImage.defaultLoader.serializeTransform(resolved);
  let src;
  if (/^[\/\\]?@astroimage/.test(resolved.src)) {
    src = `${resolved.src}?${searchParams.toString()}`;
  } else {
    searchParams.set("href", resolved.src);
    src = `/_image?${searchParams.toString()}`;
  }
  if ((_c = globalThis.astroImage) == null ? void 0 : _c.addStaticImage) {
    src = globalThis.astroImage.addStaticImage(resolved);
  }
  return {
    ...attributes,
    src
  };
}

async function resolveAspectRatio({ src, aspectRatio }) {
  if (typeof src === "string") {
    return parseAspectRatio(aspectRatio);
  } else {
    const metadata = "then" in src ? (await src).default : src;
    return parseAspectRatio(aspectRatio) || metadata.width / metadata.height;
  }
}
async function resolveFormats({ src, formats }) {
  const unique = new Set(formats);
  if (typeof src === "string") {
    unique.add(extname(src).replace(".", ""));
  } else {
    const metadata = "then" in src ? (await src).default : src;
    unique.add(extname(metadata.src).replace(".", ""));
  }
  return Array.from(unique).filter(Boolean);
}
async function getPicture(params) {
  const { src, widths, fit, position, background } = params;
  if (!src) {
    throw new Error("[@astrojs/image] `src` is required");
  }
  if (!widths || !Array.isArray(widths)) {
    throw new Error("[@astrojs/image] at least one `width` is required");
  }
  const aspectRatio = await resolveAspectRatio(params);
  if (!aspectRatio) {
    throw new Error("`aspectRatio` must be provided for remote images");
  }
  async function getSource(format) {
    const imgs = await Promise.all(
      widths.map(async (width) => {
        const img = await getImage({
          src,
          format,
          width,
          fit,
          position,
          background,
          height: Math.round(width / aspectRatio)
        });
        return `${img.src} ${width}w`;
      })
    );
    return {
      type: mime.getType(format) || format,
      srcset: imgs.join(",")
    };
  }
  const allFormats = await resolveFormats(params);
  const image = await getImage({
    src,
    width: Math.max(...widths),
    aspectRatio,
    fit,
    position,
    background,
    format: allFormats[allFormats.length - 1]
  });
  const sources = await Promise.all(allFormats.map((format) => getSource(format)));
  return {
    sources,
    image
  };
}

const PKG_NAME = "@astrojs/image";
const ROUTE_PATTERN = "/_image";
function integration(options = {}) {
  const resolvedOptions = {
    serviceEntryPoint: "@astrojs/image/squoosh",
    logLevel: "info",
    ...options
  };
  let _config;
  let _buildConfig;
  const staticImages = /* @__PURE__ */ new Map();
  function getViteConfiguration() {
    return {
      plugins: [createPlugin(_config, resolvedOptions)],
      optimizeDeps: {
        include: ["image-size"].filter(Boolean)
      },
      build: {
        rollupOptions: {
          external: ["sharp"]
        }
      },
      ssr: {
        noExternal: ["@astrojs/image", resolvedOptions.serviceEntryPoint]
      },
      assetsInclude: ["**/*.wasm"]
    };
  }
  return {
    name: PKG_NAME,
    hooks: {
      "astro:config:setup": async ({ command, config, updateConfig, injectRoute }) => {
        _config = config;
        updateConfig({ vite: getViteConfiguration() });
        if (command === "dev" || config.output === "server") {
          injectRoute({
            pattern: ROUTE_PATTERN,
            entryPoint: "@astrojs/image/endpoint"
          });
        }
        const { default: defaultLoader } = await (resolvedOptions.serviceEntryPoint === "@astrojs/image/sharp" ? import('./chunks/sharp.62bdf452.mjs') : import('./chunks/squoosh.d7a3d731.mjs'));
        globalThis.astroImage = {
          defaultLoader
        };
      },
      "astro:build:start": async ({ buildConfig }) => {
        _buildConfig = buildConfig;
      },
      "astro:build:setup": async () => {
        function addStaticImage(transform) {
          const srcTranforms = staticImages.has(transform.src) ? staticImages.get(transform.src) : /* @__PURE__ */ new Map();
          const filename = propsToFilename(transform);
          srcTranforms.set(filename, transform);
          staticImages.set(transform.src, srcTranforms);
          return prependForwardSlash(joinPaths(_config.base, "assets", filename));
        }
        if (_config.output === "static") {
          globalThis.astroImage.addStaticImage = addStaticImage;
        }
      },
      "astro:build:generated": async ({ dir }) => {
        var _a;
        const loader = (_a = globalThis == null ? void 0 : globalThis.astroImage) == null ? void 0 : _a.loader;
        if (resolvedOptions.serviceEntryPoint === "@astrojs/image/squoosh") {
          await copyWasmFiles(new URL("./chunks", dir));
        }
        if (loader && "transform" in loader && staticImages.size > 0) {
          await ssgBuild({
            loader,
            staticImages,
            config: _config,
            outDir: dir,
            logLevel: resolvedOptions.logLevel
          });
        }
      },
      "astro:build:ssr": async () => {
        if (resolvedOptions.serviceEntryPoint === "@astrojs/image/squoosh") {
          await copyWasmFiles(_buildConfig.server);
        }
      }
    }
  };
}

const $$module1$2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: integration,
	getImage,
	getPicture
}, Symbol.toStringTag, { value: 'Module' }));

createMetadata("/@fs/var/www/bryanandjessicawills.com/html/node_modules/@astrojs/image/components/Image.astro", { modules: [{ module: $$module1$2, specifier: "../dist/index.js", assert: {} }, { module: $$module1$1, specifier: "./index.js", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$8 = createAstro("/@fs/var/www/bryanandjessicawills.com/html/node_modules/@astrojs/image/components/Image.astro", "https://www.bryanwills.dev/", "file:///var/www/bryanandjessicawills.com/html/");
const $$Image = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$8, $$props, $$slots);
  Astro2.self = $$Image;
  const { loading = "lazy", decoding = "async", ...props } = Astro2.props;
  if (props.alt === void 0 || props.alt === null) {
    warnForMissingAlt();
  }
  const attrs = await getImage(props);
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`${maybeRenderHead($$result)}<img${spreadAttributes(attrs, "attrs", { "class": "astro-UXNKDZ4E" })}${addAttribute(loading, "loading")}${addAttribute(decoding, "decoding")}>

`;
});

createMetadata("/@fs/var/www/bryanandjessicawills.com/html/node_modules/@astrojs/image/components/Picture.astro", { modules: [{ module: $$module1$2, specifier: "../dist/index.js", assert: {} }, { module: $$module1$1, specifier: "./index.js", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$7 = createAstro("/@fs/var/www/bryanandjessicawills.com/html/node_modules/@astrojs/image/components/Picture.astro", "https://www.bryanwills.dev/", "file:///var/www/bryanandjessicawills.com/html/");
const $$Picture = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$7, $$props, $$slots);
  Astro2.self = $$Picture;
  const {
    src,
    alt,
    sizes,
    widths,
    aspectRatio,
    fit,
    background,
    position,
    formats = ["avif", "webp"],
    loading = "lazy",
    decoding = "async",
    ...attrs
  } = Astro2.props;
  if (alt === void 0 || alt === null) {
    warnForMissingAlt();
  }
  const { image, sources } = await getPicture({
    src,
    widths,
    formats,
    aspectRatio,
    fit,
    background,
    position
  });
  delete image.width;
  delete image.height;
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`${maybeRenderHead($$result)}<picture${spreadAttributes(attrs, "attrs", { "class": "astro-EI35XRNH" })}>
	${sources.map((attrs2) => renderTemplate`<source${spreadAttributes(attrs2, "attrs", { "class": "astro-EI35XRNH" })}${addAttribute(sizes, "sizes")}>`)}
	<img${spreadAttributes(image, "image", { "class": "astro-EI35XRNH" })}${addAttribute(loading, "loading")}${addAttribute(decoding, "decoding")}${addAttribute(alt, "alt")}>
</picture>

`;
});

let altWarningShown = false;
function warnForMissingAlt() {
  if (altWarningShown === true) {
    return;
  }
  altWarningShown = true;
  console.warn(`
[@astrojs/image] "alt" text was not provided for an <Image> or <Picture> component.

A future release of @astrojs/image may throw a build error when "alt" text is missing.

The "alt" attribute holds a text description of the image, which isn't mandatory but is incredibly useful for accessibility. Set to an empty string (alt="") if the image is not a key part of the content (it's decoration or a tracking pixel).
`);
}

const $$metadata$5 = createMetadata("/@fs/var/www/bryanandjessicawills.com/html/src/components/CreatedWithSection.astro", { modules: [{ module: $$module1$1, specifier: "@astrojs/image/components", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$6 = createAstro("/@fs/var/www/bryanandjessicawills.com/html/src/components/CreatedWithSection.astro", "https://www.bryanwills.dev/", "file:///var/www/bryanandjessicawills.com/html/");
const $$CreatedWithSection = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$CreatedWithSection;
  return renderTemplate`${maybeRenderHead($$result)}<section>
  <h2 class="font-mplus font-bold text-xl my-4 underline underline-offset-4 decoration-zinc-400 dark:decoration-zinc-700 decoration-4">
    Created with
  </h2>
  <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <li class="text-center mb-4">
      <a href="https://www.inkdrop.app/">
        ${renderComponent($$result, "Image", $$Image, { "class": "border border-slate-300 dark:border-zinc-700 rounded-xl", "src": "/inkdrop-banner.jpg", "width": 720 * 2, "aspectRatio": 2, "alt": "Inkdrop banner" })}
        <div class="mt-3 text-xl">Inkdrop</div>
        <div class="opacity-70">Markdown note-taking app</div>
      </a>
    </li>
    <li class="text-center mb-4">
      <a href="https://astro.build/">
        ${renderComponent($$result, "Image", $$Image, { "class": "border border-slate-300 dark:border-zinc-700 rounded-xl", "src": "/astrojs.jpg", "width": 720 * 2, "aspectRatio": 2, "alt": "AstroJS banner" })}

        <div class="mt-3 text-xl">Astro</div>
        <div class="opacity-70">
          Framework for building fast static websites
        </div>
      </a>
    </li>
  </ul>
</section>`;
});

const $$file$5 = "/var/www/bryanandjessicawills.com/html/src/components/CreatedWithSection.astro";
const $$url$5 = undefined;

const $$module10 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$5,
	default: $$CreatedWithSection,
	file: $$file$5,
	url: $$url$5
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$4 = createMetadata("/@fs/var/www/bryanandjessicawills.com/html/src/pages/index.astro", { modules: [{ module: $$module1$4, specifier: "../components/BaseHead.astro", assert: {} }, { module: $$module2, specifier: "../components/Header.astro", assert: {} }, { module: $$module3, specifier: "../components/Footer.astro", assert: {} }, { module: $$module4$2, specifier: "../config", assert: {} }, { module: $$module5, specifier: "../components/Body.astro", assert: {} }, { module: $$module6, specifier: "../components/Content.astro", assert: {} }, { module: $$module7, specifier: "react-icons/io5/index.js", assert: {} }, { module: $$module8, specifier: "../components/Masthead.astro", assert: {} }, { module: $$module1$1, specifier: "@astrojs/image/components", assert: {} }, { module: $$module10, specifier: "../components/CreatedWithSection.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$5 = createAstro("/@fs/var/www/bryanandjessicawills.com/html/src/pages/index.astro", "https://www.bryanwills.dev/", "file:///var/www/bryanandjessicawills.com/html/");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$Index;
  const posts = (await Astro2.glob(/* #__PURE__ */ Object.assign({"./posts/keychron-k-2.md": () => Promise.resolve().then(() => _page2),"./posts/keychron-q-1.md": () => Promise.resolve().then(() => _page3),"./posts/macbook-air.md": () => Promise.resolve().then(() => _page4),"./posts/macbook-pro.md": () => Promise.resolve().then(() => _page5)}), () => "./posts/*.md")).sort(
    (a, b) => new Date(b.frontmatter.createdAt).valueOf() - new Date(a.frontmatter.createdAt).valueOf()
  );
  return renderTemplate`<html lang="en">
  <head>
    ${renderComponent($$result, "BaseHead", $$BaseHead, { "title": SITE_TITLE, "description": SITE_DESCRIPTION })}
  ${renderHead($$result)}</head>
  ${renderComponent($$result, "Body", $$Body, {}, { "default": () => renderTemplate`${renderComponent($$result, "Header", $$Header, { "title": SITE_TITLE })}<main class="pt-[56px]">
      ${renderComponent($$result, "Masthead", $$Masthead, {})}
      ${renderComponent($$result, "Content", $$Content, {}, { "default": () => renderTemplate`<section>
          <p class="mb-8 indent-4">
            As an indie developer, I&apos;ve been spending hours and hours at my
            desk every day. So, I&apos;ve been continuously improving my
            workspace in order to boost my productivity. Whenever I upload new
            content, people ask me what tools I use. So, here is a living
            snapshot and a place to point curious developers to when I get
            asked. Most of the links are amazon affiliate links, so I&apos;ll
            get filthy rich if you click them and buy something.
            <a class="inline-flex items-center gap-1 indent-1 text-orange-500"${addAttribute(HOMEPAGE_URL, "href")}>Learn more about me ${renderComponent($$result, "IoArrowForward", IoArrowForward, { "className": "inline" })}
            </a>
          </p>
        </section><section>
          <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${posts.map((post) => renderTemplate`<li class="text-center mb-4">
                  <a${addAttribute(post.url, "href")}>
                    ${renderComponent($$result, "Image", $$Image, { "class": "border border-slate-300 dark:border-zinc-700 rounded-xl", "src": post.frontmatter.heroImage, "width": 720 * 2, "aspectRatio": 2, "alt": "Thumbnail" })}
                    <div class="mt-3 text-xl font-bold">
                      ${post.frontmatter.title}
                    </div>
                    ${post.frontmatter.description && renderTemplate`<div class="opacity-70">
                        ${post.frontmatter.description}
                      </div>`}
                  </a>
                </li>`)}
          </ul>
        </section>${renderComponent($$result, "CreatedWithSection", $$CreatedWithSection, {})}` })}
    </main>${renderComponent($$result, "Footer", $$Footer, {})}` })}
</html>`;
});

const $$file$4 = "/var/www/bryanandjessicawills.com/html/src/pages/index.astro";
const $$url$4 = "";

const _page0 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$4,
	default: $$Index,
	file: $$file$4,
	url: $$url$4
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$3 = createMetadata("/@fs/var/www/bryanandjessicawills.com/html/src/components/Breadcrumb.astro", { modules: [{ module: $$module7, specifier: "react-icons/io5/index.js", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$4 = createAstro("/@fs/var/www/bryanandjessicawills.com/html/src/components/Breadcrumb.astro", "https://www.bryanwills.dev/", "file:///var/www/bryanandjessicawills.com/html/");
const $$Breadcrumb = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$Breadcrumb;
  return renderTemplate`${maybeRenderHead($$result)}<div class="my-4 flex items-center gap-1">
  <a href="/" class="underline underline-offset-2">Index</a>
  ${renderComponent($$result, "IoChevronForward", IoChevronForward, { "className": "opacity-50" })}
  <span class="text-orange-500 font-mplus font-bold">${renderSlot($$result, $$slots["default"])}</span>
<div>
</div></div>`;
});

const $$file$3 = "/var/www/bryanandjessicawills.com/html/src/components/Breadcrumb.astro";
const $$url$3 = undefined;

const $$module4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$3,
	default: $$Breadcrumb,
	file: $$file$3,
	url: $$url$3
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$2 = createMetadata("/@fs/var/www/bryanandjessicawills.com/html/src/layouts/CategoryPosts.astro", { modules: [{ module: $$module1$1, specifier: "@astrojs/image/components", assert: {} }, { module: $$module1$4, specifier: "../components/BaseHead.astro", assert: {} }, { module: $$module5, specifier: "../components/Body.astro", assert: {} }, { module: $$module4, specifier: "../components/Breadcrumb.astro", assert: {} }, { module: $$module6, specifier: "../components/Content.astro", assert: {} }, { module: $$module3, specifier: "../components/Footer.astro", assert: {} }, { module: $$module2, specifier: "../components/Header.astro", assert: {} }, { module: $$module8, specifier: "../components/Masthead.astro", assert: {} }, { module: $$module4$2, specifier: "../config", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$3 = createAstro("/@fs/var/www/bryanandjessicawills.com/html/src/layouts/CategoryPosts.astro", "https://www.bryanwills.dev/", "file:///var/www/bryanandjessicawills.com/html/");
const $$CategoryPosts = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$CategoryPosts;
  const { category } = Astro2.props;
  const posts = (await Astro2.glob(/* #__PURE__ */ Object.assign({"../pages/posts/keychron-k-2.md": () => Promise.resolve().then(() => _page2),"../pages/posts/keychron-q-1.md": () => Promise.resolve().then(() => _page3),"../pages/posts/macbook-air.md": () => Promise.resolve().then(() => _page4),"../pages/posts/macbook-pro.md": () => Promise.resolve().then(() => _page5)}), () => "../pages/posts/*.md")).sort(
    (a, b) => new Date(b.frontmatter.createdAt).valueOf() - new Date(a.frontmatter.createdAt).valueOf()
  ).filter((item) => item.frontmatter.tags.includes(category));
  return renderTemplate`<html lang="en">
  <head>
    ${renderComponent($$result, "BaseHead", $$BaseHead, { "title": SITE_TITLE, "description": SITE_DESCRIPTION })}
  ${renderHead($$result)}</head>
  ${renderComponent($$result, "Body", $$Body, {}, { "default": () => renderTemplate`${renderComponent($$result, "Header", $$Header, { "title": SITE_TITLE })}<main class="pt-[56px]">
      ${renderComponent($$result, "Masthead", $$Masthead, {})}
      ${renderComponent($$result, "Content", $$Content, {}, { "default": () => renderTemplate`${renderComponent($$result, "Breadcrumb", $$Breadcrumb, {}, { "default": () => renderTemplate`${category}` })}<section>
          <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${posts.map((post) => renderTemplate`<li class="text-center mb-4">
                  <a${addAttribute(post.url, "href")}>
                    ${renderComponent($$result, "Image", $$Image, { "class": "border border-slate-300 dark:border-zinc-700 rounded-xl", "src": post.frontmatter.heroImage, "width": 720 * 2, "aspectRatio": 2, "alt": "Thumbnail" })}
                    <div class="mt-3 text-xl font-bold">
                      ${post.frontmatter.title}
                    </div>
                    <div>${post.frontmatter.description}</div>
                  </a>
                </li>`)}
          </ul>
        </section>` })}
      ${renderComponent($$result, "Footer", $$Footer, {})}
    </main>` })}
</html>`;
});

const $$file$2 = "/var/www/bryanandjessicawills.com/html/src/layouts/CategoryPosts.astro";
const $$url$2 = undefined;

const $$module1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$2,
	default: $$CategoryPosts,
	file: $$file$2,
	url: $$url$2
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$1 = createMetadata("/@fs/var/www/bryanandjessicawills.com/html/src/pages/categories/[id].astro", { modules: [{ module: $$module1, specifier: "../../layouts/CategoryPosts.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$2 = createAstro("/@fs/var/www/bryanandjessicawills.com/html/src/pages/categories/[id].astro", "https://www.bryanwills.dev/", "file:///var/www/bryanandjessicawills.com/html/");
const Astro = $$Astro$2;
async function getStaticPaths() {
  const allPosts = await Astro.glob(/* #__PURE__ */ Object.assign({"../posts/keychron-k-2.md": () => Promise.resolve().then(() => _page2),"../posts/keychron-q-1.md": () => Promise.resolve().then(() => _page3),"../posts/macbook-air.md": () => Promise.resolve().then(() => _page4),"../posts/macbook-pro.md": () => Promise.resolve().then(() => _page5)}), () => "../posts/*.md");
  const allTags = /* @__PURE__ */ new Set();
  allPosts.map((post) => {
    post.frontmatter.tags && post.frontmatter.tags.map((tag) => allTags.add(tag));
  });
  return Array.from(allTags).map((tag) => {
    return {
      params: { id: tag.toLowerCase() },
      props: { name: tag }
    };
  });
}
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$id;
  const { name } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "CategoryPosts", $$CategoryPosts, { "category": name })}`;
});

const $$file$1 = "/var/www/bryanandjessicawills.com/html/src/pages/categories/[id].astro";
const $$url$1 = "/categories/[id]";

const _page1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$1,
	getStaticPaths,
	default: $$id,
	file: $$file$1,
	url: $$url$1
}, Symbol.toStringTag, { value: 'Module' }));

createMetadata("/@fs/var/www/bryanandjessicawills.com/html/src/layouts/BlogPost.astro", { modules: [{ module: $$module1$4, specifier: "../components/BaseHead.astro", assert: {} }, { module: $$module2, specifier: "../components/Header.astro", assert: {} }, { module: $$module3, specifier: "../components/Footer.astro", assert: {} }, { module: $$module5, specifier: "../components/Body.astro", assert: {} }, { module: $$module6, specifier: "../components/Content.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$1 = createAstro("/@fs/var/www/bryanandjessicawills.com/html/src/layouts/BlogPost.astro", "https://www.bryanwills.dev/", "file:///var/www/bryanandjessicawills.com/html/");
const $$BlogPost = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$BlogPost;
  const {
    content: { title, description, heroImage }
  } = Astro2.props;
  return renderTemplate`<html lang="en">
  <head>
    ${renderComponent($$result, "BaseHead", $$BaseHead, { "title": title, "description": description })}
  ${renderHead($$result)}</head>

  ${renderComponent($$result, "Body", $$Body, {}, { "default": () => renderTemplate`${renderComponent($$result, "Header", $$Header, {})}<main class="pt-[56px]">
      ${renderComponent($$result, "Content", $$Content, { "className": "pt-6" }, { "default": () => renderTemplate`<div class="mb-8">
          ${heroImage && renderTemplate`<img class="border border-slate-300 dark:border-zinc-700 rounded-xl"${addAttribute(720, "width")}${addAttribute(360, "height")}${addAttribute(heroImage, "src")} alt="">`}
        </div><h1 class="text-3xl my-1 font-mplus">${title}</h1><div>${description}</div><hr class="border-top border-zinc-400 my-4">${renderSlot($$result, $$slots["default"])}<span class="underline underline-offset-2 hover:text-orange-500 decoration-orange-500 text-2xl"></span>` })}
    </main>${renderComponent($$result, "Footer", $$Footer, {})}` })}
</html>`;
});

const html$3 = "<p class=\"mb-6\">It’s <a href=\"https://www.keychron.com/products/keychron-k2-wireless-mechanical-keyboard\" class=\"underline underline-offset-2 hover:text-orange-500 decoration-orange-500\">Keychron K2</a> (V1). I was using V2 but its spacebar was broken for some reason. It got Gateron brown switches.</p>\n<p class=\"mb-6\"><img src=\"/posts/keychron-k-2_keychron-k2-2-jpg.jpg\" alt=\"keychron-k2_2.jpg\" class=\"border border-slate-300 dark:border-zinc-700 rounded-xl mb-6\"></p>\n<p class=\"mb-6\">I’ve customized the keycaps with <a href=\"https://kbdfans.com/products/pga-profile-sparta-abs-doubleshot-keycaps-set\" class=\"underline underline-offset-2 hover:text-orange-500 decoration-orange-500\">PGA profile ABS Doubleshot keycaps</a>. It is the first time to use PGA profile though I like it so far.</p>\n<p class=\"mb-6\"><img src=\"/posts/keychron-k-2_keychron-k2-3-jpg.jpg\" alt=\"keychron-k2_3.jpg\" class=\"border border-slate-300 dark:border-zinc-700 rounded-xl mb-6\"></p>";

				const frontmatter$3 = {"description":"Portable wireless mechanical keyboard","public":true,"layout":"../../layouts/BlogPost.astro","title":"Keychron K2","createdAt":1632100083000,"updatedAt":1663636112618,"tags":["Computing"],"heroImage":"/posts/keychron-k-2_thumbnail.jpg","slug":"keychron-k-2"};
				const file$3 = "/var/www/bryanandjessicawills.com/html/src/pages/posts/keychron-k-2.md";
				const url$3 = "/posts/keychron-k-2";
				function rawContent$3() {
					return "\n\nIt's [Keychron K2](https://www.keychron.com/products/keychron-k2-wireless-mechanical-keyboard) (V1). I was using V2 but its spacebar was broken for some reason. It got Gateron brown switches.\n\n![keychron-k2_2.jpg](/posts/keychron-k-2_keychron-k2-2-jpg.jpg)\n\nI've customized the keycaps with [PGA profile ABS Doubleshot keycaps](https://kbdfans.com/products/pga-profile-sparta-abs-doubleshot-keycaps-set). It is the first time to use PGA profile though I like it so far.\n\n![keychron-k2_3.jpg](/posts/keychron-k-2_keychron-k2-3-jpg.jpg)";
				}
				function compiledContent$3() {
					return html$3;
				}
				function getHeadings$3() {
					return [];
				}
				function getHeaders$3() {
					console.warn('getHeaders() have been deprecated. Use getHeadings() function instead.');
					return getHeadings$3();
				}				async function Content$3() {
					const { layout, ...content } = frontmatter$3;
					content.file = file$3;
					content.url = url$3;
					content.astro = {};
					Object.defineProperty(content.astro, 'headings', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "headings" from your layout, try using "Astro.props.headings."')
						}
					});
					Object.defineProperty(content.astro, 'html', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "html" from your layout, try using "Astro.props.compiledContent()."')
						}
					});
					Object.defineProperty(content.astro, 'source', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "source" from your layout, try using "Astro.props.rawContent()."')
						}
					});
					const contentFragment = createVNode(Fragment, { 'set:html': html$3 });
					return createVNode($$BlogPost, {
									file: file$3,
									url: url$3,
									content,
									frontmatter: content,
									headings: getHeadings$3(),
									rawContent: rawContent$3,
									compiledContent: compiledContent$3,
									'server:root': true,
									children: contentFragment
								});
				}
				Content$3[Symbol.for('astro.needsHeadRendering')] = false;

const _page2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	frontmatter: frontmatter$3,
	file: file$3,
	url: url$3,
	rawContent: rawContent$3,
	compiledContent: compiledContent$3,
	getHeadings: getHeadings$3,
	getHeaders: getHeaders$3,
	Content: Content$3,
	default: Content$3
}, Symbol.toStringTag, { value: 'Module' }));

const html$2 = "<p class=\"mb-6\">To be honest, I don’t really care about keyboards. So, I’ve been just using Apple Wireless Keyboard and was happy with it. But I wanted people to enjoy more the typing sounds, I started to search for good mechanical keyboards. Here, <a href=\"https://www.keychron.com/products/keychron-q1\" class=\"underline underline-offset-2 hover:text-orange-500 decoration-orange-500\">Keychron Q1</a> is one of my favorite keyboards at the moment.\nDue to its weight, it stably holds on your desk.</p>\n<p class=\"mb-6\"><img src=\"/posts/keychron-q-1_keychron-q1-2-jpg.jpg\" alt=\"keychron-q1_2.jpg\" class=\"border border-slate-300 dark:border-zinc-700 rounded-xl mb-6\"></p>\n<p class=\"mb-6\">The switches are <a href=\"https://amzn.to/3RWbP8N\" class=\"underline underline-offset-2 hover:text-orange-500 decoration-orange-500\">Gateron Zealios V2 67g</a>. They feel clicky but sound not loud like brown switches. Love them.</p>\n<p class=\"mb-6\"><img src=\"/posts/keychron-q-1_keychron-q1-3-jpg.jpg\" alt=\"keychron-q1_3.jpg\" class=\"border border-slate-300 dark:border-zinc-700 rounded-xl mb-6\"></p>\n<p class=\"mb-6\">The keycaps are <a href=\"https://www.keychron.com/products/double-shot-pbt-osa-full-set-keycap-set\" class=\"underline underline-offset-2 hover:text-orange-500 decoration-orange-500\">Double Shot PBT OSA Full Set Keycap Set</a>.</p>\n<p class=\"mb-6\"><img src=\"/posts/keychron-q-1_keychron-q1-4-jpg.jpg\" alt=\"keychron-q1_4.jpg\" class=\"border border-slate-300 dark:border-zinc-700 rounded-xl mb-6\"></p>\n<p class=\"mb-6\">Beautiful. Minimal. Good typing sounds.</p>";

				const frontmatter$2 = {"description":"Mechanical keyboard","public":true,"layout":"../../layouts/BlogPost.astro","title":"Keychron Q1","createdAt":1663636000714,"updatedAt":1663636038883,"tags":["Computing"],"heroImage":"https://github.com/bryanwills/wedding/blob/main/public/astrojs.jpg","slug":"keychron-q-1"};
				const file$2 = "/var/www/bryanandjessicawills.com/html/src/pages/posts/keychron-q-1.md";
				const url$2 = "/posts/keychron-q-1";
				function rawContent$2() {
					return "\n\nTo be honest, I don't really care about keyboards. So, I've been just using Apple Wireless Keyboard and was happy with it. But I wanted people to enjoy more the typing sounds, I started to search for good mechanical keyboards. Here, [Keychron Q1](https://www.keychron.com/products/keychron-q1) is one of my favorite keyboards at the moment.\nDue to its weight, it stably holds on your desk.\n\n![keychron-q1_2.jpg](/posts/keychron-q-1_keychron-q1-2-jpg.jpg)\n\nThe switches are [Gateron Zealios V2 67g](https://amzn.to/3RWbP8N). They feel clicky but sound not loud like brown switches. Love them.\n\n![keychron-q1_3.jpg](/posts/keychron-q-1_keychron-q1-3-jpg.jpg)\n\nThe keycaps are [Double Shot PBT OSA Full Set Keycap Set](https://www.keychron.com/products/double-shot-pbt-osa-full-set-keycap-set).\n\n![keychron-q1_4.jpg](/posts/keychron-q-1_keychron-q1-4-jpg.jpg)\n\nBeautiful. Minimal. Good typing sounds.\n";
				}
				function compiledContent$2() {
					return html$2;
				}
				function getHeadings$2() {
					return [];
				}
				function getHeaders$2() {
					console.warn('getHeaders() have been deprecated. Use getHeadings() function instead.');
					return getHeadings$2();
				}				async function Content$2() {
					const { layout, ...content } = frontmatter$2;
					content.file = file$2;
					content.url = url$2;
					content.astro = {};
					Object.defineProperty(content.astro, 'headings', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "headings" from your layout, try using "Astro.props.headings."')
						}
					});
					Object.defineProperty(content.astro, 'html', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "html" from your layout, try using "Astro.props.compiledContent()."')
						}
					});
					Object.defineProperty(content.astro, 'source', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "source" from your layout, try using "Astro.props.rawContent()."')
						}
					});
					const contentFragment = createVNode(Fragment, { 'set:html': html$2 });
					return createVNode($$BlogPost, {
									file: file$2,
									url: url$2,
									content,
									frontmatter: content,
									headings: getHeadings$2(),
									rawContent: rawContent$2,
									compiledContent: compiledContent$2,
									'server:root': true,
									children: contentFragment
								});
				}
				Content$2[Symbol.for('astro.needsHeadRendering')] = false;

const _page3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	frontmatter: frontmatter$2,
	file: file$2,
	url: url$2,
	rawContent: rawContent$2,
	compiledContent: compiledContent$2,
	getHeadings: getHeadings$2,
	getHeaders: getHeaders$2,
	Content: Content$2,
	default: Content$2
}, Symbol.toStringTag, { value: 'Module' }));

const html$1 = "<p class=\"mb-6\">MacBook Air is my sub-machine. As you may know, I’m running a small business called <a href=\"https://www.inkdrop.app/\" class=\"underline underline-offset-2 hover:text-orange-500 decoration-orange-500\">Inkdrop</a>. So, having a secondary computer is crucial in case the main machine breaks down. I must be available for providing user support and dealing with incidents.</p>\n<p class=\"mb-6\"><img src=\"/posts/macbook-air_macbook-air-m2-2-jpg.jpg\" alt=\"macbook-air-m2_2.jpg\" class=\"border border-slate-300 dark:border-zinc-700 rounded-xl mb-6\"></p>\n<p class=\"mb-6\">I didn’t feel like buying another beefy computer like M1 Max MBP. So, I decided to get the M2 MacBook Air.\nIt’s less powerful than Pro, but sufficient for looking into the servers, giving user support, web browsing, and doing some front-end coding.\nIt’s hard to edit videos and build mobile apps on it.\nBut I love how lightweight it is. Great for hiking, travel, etc.</p>";

				const frontmatter$1 = {"description":"Laptop computer","slug":"macbook-air","public":true,"layout":"../../layouts/BlogPost.astro","title":"MacBook Air (M2)","createdAt":1663220312000,"updatedAt":1663134147373,"tags":["Computing"],"heroImage":"/posts/macbook-air_thumbnail.jpg"};
				const file$1 = "/var/www/bryanandjessicawills.com/html/src/pages/posts/macbook-air.md";
				const url$1 = "/posts/macbook-air";
				function rawContent$1() {
					return "\n\nMacBook Air is my sub-machine. As you may know, I'm running a small business called [Inkdrop](https://www.inkdrop.app/). So, having a secondary computer is crucial in case the main machine breaks down. I must be available for providing user support and dealing with incidents.\n\n![macbook-air-m2_2.jpg](/posts/macbook-air_macbook-air-m2-2-jpg.jpg)\n\nI didn't feel like buying another beefy computer like M1 Max MBP. So, I decided to get the M2 MacBook Air.\nIt's less powerful than Pro, but sufficient for looking into the servers, giving user support, web browsing, and doing some front-end coding.\nIt's hard to edit videos and build mobile apps on it.\nBut I love how lightweight it is. Great for hiking, travel, etc.";
				}
				function compiledContent$1() {
					return html$1;
				}
				function getHeadings$1() {
					return [];
				}
				function getHeaders$1() {
					console.warn('getHeaders() have been deprecated. Use getHeadings() function instead.');
					return getHeadings$1();
				}				async function Content$1() {
					const { layout, ...content } = frontmatter$1;
					content.file = file$1;
					content.url = url$1;
					content.astro = {};
					Object.defineProperty(content.astro, 'headings', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "headings" from your layout, try using "Astro.props.headings."')
						}
					});
					Object.defineProperty(content.astro, 'html', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "html" from your layout, try using "Astro.props.compiledContent()."')
						}
					});
					Object.defineProperty(content.astro, 'source', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "source" from your layout, try using "Astro.props.rawContent()."')
						}
					});
					const contentFragment = createVNode(Fragment, { 'set:html': html$1 });
					return createVNode($$BlogPost, {
									file: file$1,
									url: url$1,
									content,
									frontmatter: content,
									headings: getHeadings$1(),
									rawContent: rawContent$1,
									compiledContent: compiledContent$1,
									'server:root': true,
									children: contentFragment
								});
				}
				Content$1[Symbol.for('astro.needsHeadRendering')] = false;

const _page4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	frontmatter: frontmatter$1,
	file: file$1,
	url: url$1,
	rawContent: rawContent$1,
	compiledContent: compiledContent$1,
	getHeadings: getHeadings$1,
	getHeaders: getHeaders$1,
	Content: Content$1,
	default: Content$1
}, Symbol.toStringTag, { value: 'Module' }));

const html = "<p class=\"mb-6\">MacBook Pro (14-inch, 2021) is my main computer for app devs, designing, video editing, and everything else.\nIt’s so powerful and really a good foundation to create digital stuff. It will stay with you regardless of how far you wanna go, how crazy you want to experiment whatever. And bonus: It’s portable!</p>\n<p class=\"mb-6\"><img src=\"/posts/macbook-pro_macbook-pro-m1-max-jpg.jpg\" alt=\"macbook-pro-m1-max.jpg\" class=\"border border-slate-300 dark:border-zinc-700 rounded-xl mb-6\"></p>\n<p class=\"mb-6\">So, I can enjoy coding wherever like at cafes, hotels, and even in nature :) Pretty awesome.\nIt would have not been possible to film coding videos in nature like this, thanks to its high power efficiency.</p>\n<p class=\"mb-6\"><img src=\"/posts/macbook-pro_macbook-pro-m1-max-3-jpg.jpg\" alt=\"macbook-pro-m1-max_3.jpg\" class=\"border border-slate-300 dark:border-zinc-700 rounded-xl mb-6\">\n<a href=\"https://www.youtube.com/watch?v=GznmPACXBlY\" class=\"underline underline-offset-2 hover:text-orange-500 decoration-orange-500\"><strong>WATCH</strong>: How I built a software agency website with Next.js + Tailwind CSS (in nature)</a></p>\n<p class=\"mb-6\">I chose 14-inch because 16-inch is too big for me. I connect it with <a href=\"/posts/pro-display-xdr\" class=\"underline underline-offset-2 hover:text-orange-500 decoration-orange-500\">Pro Display XDR</a>\nat home.</p>";

				const frontmatter = {"description":"Laptop computer","slug":"macbook-pro","public":true,"layout":"../../layouts/BlogPost.astro","title":"MacBook Pro (M1 Max)","createdAt":1663205542000,"updatedAt":1663138785310,"tags":["Computing"],"heroImage":"/posts/macbook-pro_thumbnail.jpg"};
				const file = "/var/www/bryanandjessicawills.com/html/src/pages/posts/macbook-pro.md";
				const url = "/posts/macbook-pro";
				function rawContent() {
					return "\n\nMacBook Pro (14-inch, 2021) is my main computer for app devs, designing, video editing, and everything else.\nIt's so powerful and really a good foundation to create digital stuff. It will stay with you regardless of how far you wanna go, how crazy you want to experiment whatever. And bonus: It's portable!\n\n![macbook-pro-m1-max.jpg](/posts/macbook-pro_macbook-pro-m1-max-jpg.jpg)\n\nSo, I can enjoy coding wherever like at cafes, hotels, and even in nature :) Pretty awesome.\nIt would have not been possible to film coding videos in nature like this, thanks to its high power efficiency.\n\n![macbook-pro-m1-max_3.jpg](/posts/macbook-pro_macbook-pro-m1-max-3-jpg.jpg)\n[**WATCH**: How I built a software agency website with Next.js + Tailwind CSS (in nature)](https://www.youtube.com/watch?v=GznmPACXBlY)\n\nI chose 14-inch because 16-inch is too big for me. I connect it with [Pro Display XDR](/posts/pro-display-xdr)\nat home.\n";
				}
				function compiledContent() {
					return html;
				}
				function getHeadings() {
					return [];
				}
				function getHeaders() {
					console.warn('getHeaders() have been deprecated. Use getHeadings() function instead.');
					return getHeadings();
				}				async function Content() {
					const { layout, ...content } = frontmatter;
					content.file = file;
					content.url = url;
					content.astro = {};
					Object.defineProperty(content.astro, 'headings', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "headings" from your layout, try using "Astro.props.headings."')
						}
					});
					Object.defineProperty(content.astro, 'html', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "html" from your layout, try using "Astro.props.compiledContent()."')
						}
					});
					Object.defineProperty(content.astro, 'source', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "source" from your layout, try using "Astro.props.rawContent()."')
						}
					});
					const contentFragment = createVNode(Fragment, { 'set:html': html });
					return createVNode($$BlogPost, {
									file,
									url,
									content,
									frontmatter: content,
									headings: getHeadings(),
									rawContent,
									compiledContent,
									'server:root': true,
									children: contentFragment
								});
				}
				Content[Symbol.for('astro.needsHeadRendering')] = false;

const _page5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	frontmatter,
	file,
	url,
	rawContent,
	compiledContent,
	getHeadings,
	getHeaders,
	Content,
	default: Content
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata = createMetadata("/@fs/var/www/bryanandjessicawills.com/html/src/pages/404.astro", { modules: [{ module: $$module1$4, specifier: "../components/BaseHead.astro", assert: {} }, { module: $$module2, specifier: "../components/Header.astro", assert: {} }, { module: $$module3, specifier: "../components/Footer.astro", assert: {} }, { module: $$module4$2, specifier: "../config", assert: {} }, { module: $$module5, specifier: "../components/Body.astro", assert: {} }, { module: $$module6, specifier: "../components/Content.astro", assert: {} }, { module: $$module7, specifier: "react-icons/io5/index.js", assert: {} }, { module: $$module8, specifier: "../components/Masthead.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro = createAstro("/@fs/var/www/bryanandjessicawills.com/html/src/pages/404.astro", "https://www.bryanwills.dev/", "file:///var/www/bryanandjessicawills.com/html/");
const $$404 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$404;
  return renderTemplate`<html lang="en">
  <head>
    ${renderComponent($$result, "BaseHead", $$BaseHead, { "title": SITE_TITLE, "description": SITE_DESCRIPTION })}
  ${renderHead($$result)}</head>
  ${renderComponent($$result, "Body", $$Body, {}, { "default": () => renderTemplate`${renderComponent($$result, "Header", $$Header, { "title": SITE_TITLE })}<main class="pt-[56px]">
      ${renderComponent($$result, "Masthead", $$Masthead, {})}
      ${renderComponent($$result, "Content", $$Content, {}, { "default": () => renderTemplate`<section>
          <h1 class="text-3xl text-center font-mplus mt-12 mb-8">
            Oops, not found
          </h1>
          <div class="text-center py-4">
            <a class="inline-flex items-center gap-1 underline underline-offset-2 decoration-orange-500" href="/">Go to Index ${renderComponent($$result, "IoChevronForward", IoChevronForward, {})}
            </a>
          </div><a href="/"> </a>
        </section><a href="/"> </a><a href="/"> </a>` })}
    </main><a href="/">
      ${renderComponent($$result, "Footer", $$Footer, {})}
    </a><a href="/"> </a>` })}
</html>`;
});

const $$file = "/var/www/bryanandjessicawills.com/html/src/pages/404.astro";
const $$url = "/404";

const _page6 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata,
	default: $$404,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const pageMap = new Map([['src/pages/index.astro', _page0],['src/pages/categories/[id].astro', _page1],['src/pages/posts/keychron-k-2.md', _page2],['src/pages/posts/keychron-q-1.md', _page3],['src/pages/posts/macbook-air.md', _page4],['src/pages/posts/macbook-pro.md', _page5],['src/pages/404.astro', _page6],]);
const renderers = [Object.assign({"name":"astro:jsx","serverEntrypoint":"astro/jsx/server.js","jsxImportSource":"astro"}, { ssr: server_default }),Object.assign({"name":"@astrojs/react","clientEntrypoint":"@astrojs/react/client.js","serverEntrypoint":"@astrojs/react/server.js","jsxImportSource":"react"}, { ssr: _renderer1 }),];

export { BaseSSRService as B, isRemoteImage as a, error as e, isOutputFormatSupportsAlpha as i, metadata as m, pageMap, renderers };
