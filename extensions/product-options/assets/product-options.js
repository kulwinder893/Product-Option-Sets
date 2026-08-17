/* Product Options — storefront renderer.
   Reads the merchant's option sets from the app proxy and renders them as
   line item properties inside the theme's product form. */
(function () {
  "use strict";

  var CONTEXT_SELECTOR = "script[data-product-options-context]";
  var SLOT_SELECTOR = "[data-product-options-slot]";
  var ROOT_CLASS = "product-options";
  /** Hidden line item property listing the properties this app added. */
  var OWNED_NAMES_PROPERTY = "_po_fields";

  /** Append `?po_debug=1` to any storefront URL to trace what the script does. */
  var DEBUG = /[?&]po_debug=1/.test(window.location.search);

  function debug() {
    if (!DEBUG) return;
    console.log.apply(
      console,
      ["[product-options]"].concat(Array.prototype.slice.call(arguments))
    );
  }

  var PRESENTATIONAL = ["HEADING", "PARAGRAPH", "DIVIDER", "SPACER", "CUSTOM_HTML"];

  /* ---------------------------------------------------------------- utils */

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function isPresentational(type) {
    return PRESENTATIONAL.indexOf(type) !== -1;
  }

  function toCents(amount) {
    var value = Number(amount);
    return isFinite(value) ? Math.round(value * 100) : 0;
  }

  function withDelimiters(cents, precision, thousands, decimal) {
    var value = (Math.abs(cents) / 100).toFixed(precision);
    var parts = value.split(".");
    var whole = parts[0].replace(/(\d)(?=(\d\d\d)+$)/g, "$1" + thousands);
    return precision > 0 ? whole + decimal + parts[1] : whole;
  }

  function formatMoney(cents, format) {
    var placeholder = /\{\{\s*(\w+)\s*\}\}/;
    var match = format && format.match(placeholder);
    if (!match) return withDelimiters(cents, 2, ",", ".");

    var formatted;
    switch (match[1]) {
      case "amount_no_decimals":
        formatted = withDelimiters(cents, 0, ",", ".");
        break;
      case "amount_with_comma_separator":
        formatted = withDelimiters(cents, 2, ".", ",");
        break;
      case "amount_no_decimals_with_comma_separator":
        formatted = withDelimiters(cents, 0, ".", ",");
        break;
      case "amount_with_apostrophe_separator":
        formatted = withDelimiters(cents, 2, "'", ".");
        break;
      default:
        formatted = withDelimiters(cents, 2, ",", ".");
    }
    return format.replace(placeholder, formatted);
  }

  function readContext() {
    var node = document.querySelector(CONTEXT_SELECTOR);
    if (!node) return null;
    try {
      return JSON.parse(node.textContent);
    } catch (error) {
      console.warn("[product-options] Could not parse block context.", error);
      return null;
    }
  }

  function findProductForm() {
    var forms = Array.prototype.slice.call(
      document.querySelectorAll('form[action*="/cart/add"]')
    );
    for (var i = 0; i < forms.length; i++) {
      if (forms[i].querySelector('[name="id"]')) return forms[i];
    }
    return forms[0] || null;
  }

  function findBuyButtonAnchor(form) {
    var button =
      form.querySelector('[name="add"]') ||
      form.querySelector('button[type="submit"]');
    if (!button) return null;
    return button.closest(".product-form__buttons") || button;
  }

  /* ------------------------------------------------------------- fetching */

  function buildProxyUrl(context) {
    var product = context.product || {};
    var params = new URLSearchParams({
      product_id: String(product.id || ""),
      handle: product.handle || "",
      title: product.title || "",
      vendor: product.vendor || "",
      product_type: product.productType || "",
      tags: (product.tags || []).join(","),
    });
    return context.proxyPath + "?" + params.toString();
  }

  function fetchOptionSets(context) {
    return fetch(buildProxyUrl(context), {
      headers: { Accept: "application/json" },
      credentials: "same-origin",
    })
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then(function (payload) {
        return {
          optionSets: (payload && payload.optionSets) || [],
          design: (payload && payload.design) || null,
        };
      });
  }

  function applyDesign(design) {
    if (!design) return;

    if (design.googleFontsUrl && !document.querySelector('link[data-product-options-fonts]')) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = design.googleFontsUrl;
      link.setAttribute("data-product-options-fonts", "");
      document.head.appendChild(link);
    }

    if (design.css && !document.querySelector("style[data-product-options-design]")) {
      var style = document.createElement("style");
      style.setAttribute("data-product-options-design", "");
      style.textContent = design.css;
      document.head.appendChild(style);
    }
  }

  /* -------------------------------------------------------------- helpers */

  function childrenOf(fields, parentId) {
    return fields.filter(function (field) {
      return (field.parentId || null) === parentId;
    });
  }

  function uniquePropertyName(used, label) {
    var base = (label || "Option").trim() || "Option";
    var name = base;
    var suffix = 2;
    while (used.indexOf(name) !== -1) {
      name = base + " (" + suffix + ")";
      suffix += 1;
    }
    used.push(name);
    return name;
  }

  /**
   * Cart and checkout always render a property as "name value", so hiding the
   * option name means giving it a key that renders as nothing. Repeating the
   * zero-width space keeps every key unique without becoming visible.
   */
  function uniqueBlankPropertyName(used) {
    var name = "\u200B";
    while (used.indexOf(name) !== -1) name += "\u200B";
    used.push(name);
    return name;
  }

  /* ------------------------------------------------------------ rendering */

  function Renderer(context) {
    this.context = context;
    this.settings = context.settings || {};
    this.controls = [];
    this.usedNames = [];
  }

  Renderer.prototype.priceLabel = function (amount) {
    if (!this.settings.showPriceAddons) return null;
    var cents = toCents(amount);
    if (!cents) return null;
    var sign = cents > 0 ? "+" : "-";
    return sign + formatMoney(Math.abs(cents), this.context.moneyFormat);
  };

  Renderer.prototype.labelNode = function (field) {
    var wrapper = el("label", ROOT_CLASS + "__label");
    wrapper.appendChild(el("span", ROOT_CLASS + "__label-text", field.label));

    if (field.required) {
      var marker = this.settings.requiredMarker || "*";
      wrapper.appendChild(el("span", ROOT_CLASS + "__required", marker));
    }

    var price = this.priceLabel(field.settings && field.settings.priceAddon);
    if (price) {
      wrapper.appendChild(el("span", ROOT_CLASS + "__addon", price));
    }

    var selected = el("span", ROOT_CLASS + "__selected-value");
    selected.hidden = true;
    wrapper.appendChild(selected);
    return wrapper;
  };

  Renderer.prototype.choiceLabel = function (choice) {
    var price = this.priceLabel(choice.priceAddon);
    return price ? choice.label + " (" + price + ")" : choice.label;
  };

  /** Presentational blocks render markup only; they never produce a property. */
  Renderer.prototype.renderStatic = function (field, wrapper) {
    var settings = field.settings || {};

    if (field.type === "HEADING") {
      var level = Math.min(Math.max(Number(settings.headingLevel) || 3, 1), 4);
      wrapper.appendChild(el("h" + level, ROOT_CLASS + "__heading", field.label));
      return;
    }
    if (field.type === "PARAGRAPH") {
      wrapper.appendChild(
        el("p", ROOT_CLASS + "__paragraph", settings.content || field.label)
      );
      return;
    }
    if (field.type === "DIVIDER") {
      wrapper.appendChild(el("hr", ROOT_CLASS + "__divider"));
      return;
    }
    if (field.type === "SPACER") {
      var spacer = el("div", ROOT_CLASS + "__spacer");
      spacer.style.height = (Number(settings.spacerSize) || 16) + "px";
      wrapper.appendChild(spacer);
      return;
    }
    if (field.type === "CUSTOM_HTML") {
      var html = el("div", ROOT_CLASS + "__html");
      html.innerHTML = settings.content || "";
      wrapper.appendChild(html);
    }
  };

  Renderer.prototype.renderTextual = function (field, wrapper) {
    var settings = field.settings || {};
    var input;

    if (field.type === "TEXTAREA") {
      input = el("textarea", ROOT_CLASS + "__input " + ROOT_CLASS + "__textarea");
      input.rows = 3;
    } else {
      input = el("input", ROOT_CLASS + "__input");
      input.type =
        field.type === "DATE_PICKER"
          ? "date"
          : field.type === "TIME_PICKER"
            ? "time"
            : field.type === "NUMBER" || field.type === "QUANTITY"
              ? "number"
              : "text";
    }

    if (field.placeholder) input.placeholder = field.placeholder;
    if (field.defaultValue) input.value = field.defaultValue;
    if (field.minLength != null) input.minLength = field.minLength;
    if (field.maxLength != null) input.maxLength = field.maxLength;

    if (field.type === "NUMBER" || field.type === "QUANTITY") {
      if (settings.min != null) input.min = settings.min;
      if (settings.max != null) input.max = settings.max;
      if (settings.step != null) input.step = settings.step;
    }
    if (field.type === "QUANTITY") {
      input.className += " " + ROOT_CLASS + "__quantity";
    }
    if (field.type === "DATE_PICKER") {
      if (settings.minDate) input.min = settings.minDate;
      if (settings.maxDate) input.max = settings.maxDate;
    }

    wrapper.appendChild(input);

    return function () {
      return { value: input.value.trim(), cents: 0 };
    };
  };

  Renderer.prototype.renderRange = function (field, wrapper) {
    var settings = field.settings || {};
    var row = el("div", ROOT_CLASS + "__range-row");
    var input = el("input", ROOT_CLASS + "__range");
    input.type = "range";
    input.min = settings.min != null ? settings.min : 0;
    input.max = settings.max != null ? settings.max : 100;
    input.step = settings.step != null ? settings.step : 1;
    input.value = field.defaultValue || input.min;

    var output = el("output", ROOT_CLASS + "__range-value", input.value);
    input.addEventListener("input", function () {
      output.textContent = input.value + (settings.unit ? " " + settings.unit : "");
    });

    row.appendChild(input);
    row.appendChild(output);
    wrapper.appendChild(row);

    return function () {
      return {
        value: input.value + (settings.unit ? " " + settings.unit : ""),
        cents: 0,
      };
    };
  };

  Renderer.prototype.renderDateRange = function (field, wrapper) {
    var row = el("div", ROOT_CLASS + "__range-row");
    var start = el("input", ROOT_CLASS + "__input");
    var end = el("input", ROOT_CLASS + "__input");
    start.type = "date";
    end.type = "date";
    row.appendChild(start);
    row.appendChild(el("span", ROOT_CLASS + "__range-sep", "→"));
    row.appendChild(end);
    wrapper.appendChild(row);

    return function () {
      if (!start.value || !end.value) return { value: "", cents: 0 };
      return { value: start.value + " → " + end.value, cents: 0 };
    };
  };

  Renderer.prototype.renderSelect = function (field, wrapper) {
    var self = this;
    var select = el("select", ROOT_CLASS + "__input " + ROOT_CLASS + "__select");

    var placeholder = el(
      "option",
      null,
      field.placeholder || "Select an option"
    );
    placeholder.value = "";
    select.appendChild(placeholder);

    field.choices.forEach(function (choice) {
      var option = el("option", null, self.choiceLabel(choice));
      option.value = choice.id;
      if (choice.isDisabled) option.disabled = true;
      if (choice.isDefault) option.selected = true;
      select.appendChild(option);
    });

    wrapper.appendChild(select);

    return function () {
      var choice = field.choices.filter(function (item) {
        return item.id === select.value;
      })[0];
      if (!choice) return { value: "", cents: 0 };
      return { value: choice.label, cents: toCents(choice.priceAddon) };
    };
  };

  Renderer.prototype.renderChoiceList = function (field, wrapper) {
    var self = this;
    var multiple = field.type === "CHECKBOX" && field.settings.allowMultiple !== false;
    var inputType = multiple || field.type === "CHECKBOX" ? "checkbox" : "radio";
    var groupName = ROOT_CLASS + "-" + field.id;

    var list = el("div", ROOT_CLASS + "__choices");
    if (field.settings.columns > 1) {
      list.style.gridTemplateColumns =
        "repeat(" + field.settings.columns + ", minmax(0, 1fr))";
    }

    var inputs = [];
    field.choices.forEach(function (choice) {
      var item = el("label", ROOT_CLASS + "__choice");
      var input = el("input", ROOT_CLASS + "__choice-input");
      input.type = inputType;
      input.name = groupName;
      input.value = choice.id;
      if (choice.isDefault) input.checked = true;
      if (choice.isDisabled) {
        input.disabled = true;
        item.classList.add("is-disabled");
      }

      item.appendChild(input);
      item.appendChild(el("span", ROOT_CLASS + "__choice-label", self.choiceLabel(choice)));
      list.appendChild(item);
      inputs.push({ input: input, choice: choice });
    });

    wrapper.appendChild(list);

    return function () {
      var selected = inputs.filter(function (entry) {
        return entry.input.checked;
      });
      return {
        value: selected
          .map(function (entry) {
            return entry.choice.label;
          })
          .join(", "),
        cents: selected.reduce(function (sum, entry) {
          return sum + toCents(entry.choice.priceAddon);
        }, 0),
      };
    };
  };

  Renderer.prototype.renderSwatches = function (field, wrapper) {
    var self = this;
    var isColor = field.type === "COLOR_SWATCHES";
    var shape = (field.settings && field.settings.swatchShape) || (isColor ? "circle" : "square");
    var groupName = ROOT_CLASS + "-" + field.id;

    var list = el(
      "div",
      ROOT_CLASS + "__swatches " + ROOT_CLASS + "__swatches--" + shape
    );
    var inputs = [];

    field.choices.forEach(function (choice) {
      var item = el("label", ROOT_CLASS + "__swatch");
      item.title = self.choiceLabel(choice);

      var input = el("input", ROOT_CLASS + "__swatch-input");
      input.type = "radio";
      input.name = groupName;
      input.value = choice.id;
      if (choice.isDefault) input.checked = true;
      if (choice.isDisabled) {
        input.disabled = true;
        item.classList.add("is-disabled");
      }

      var visual = el("span", ROOT_CLASS + "__swatch-visual");
      if (isColor) {
        visual.style.backgroundColor = choice.colorHex || "#e5e5e5";
      } else if (choice.imageUrl) {
        visual.style.backgroundImage = 'url("' + choice.imageUrl + '")';
      } else {
        visual.classList.add("is-empty");
      }

      item.appendChild(input);
      item.appendChild(visual);
      item.appendChild(el("span", ROOT_CLASS + "__swatch-label", choice.label));
      list.appendChild(item);
      inputs.push({ input: input, choice: choice });
    });

    wrapper.appendChild(list);

    return function () {
      var selected = inputs.filter(function (entry) {
        return entry.input.checked;
      })[0];
      if (!selected) return { value: "", cents: 0 };
      return {
        value: selected.choice.label,
        cents: toCents(selected.choice.priceAddon),
      };
    };
  };

  Renderer.prototype.renderButtons = function (field, wrapper) {
    var self = this;
    var groupName = ROOT_CLASS + "-" + field.id;
    var list = el("div", ROOT_CLASS + "__buttons");
    var inputs = [];

    field.choices.forEach(function (choice) {
      var item = el("label", ROOT_CLASS + "__button");
      var input = el("input", ROOT_CLASS + "__button-input");
      input.type = "radio";
      input.name = groupName;
      input.value = choice.id;
      if (choice.isDefault) input.checked = true;
      if (choice.isDisabled) {
        input.disabled = true;
        item.classList.add("is-disabled");
      }
      item.appendChild(input);
      item.appendChild(el("span", null, self.choiceLabel(choice)));
      list.appendChild(item);
      inputs.push({ input: input, choice: choice });
    });

    wrapper.appendChild(list);

    return function () {
      var selected = inputs.filter(function (entry) {
        return entry.input.checked;
      })[0];
      if (!selected) return { value: "", cents: 0 };
      return {
        value: selected.choice.label,
        cents: toCents(selected.choice.priceAddon),
      };
    };
  };

  Renderer.prototype.renderSwitch = function (field, wrapper) {
    var item = el("label", ROOT_CLASS + "__switch");
    var input = el("input", ROOT_CLASS + "__switch-input");
    input.type = "checkbox";
    if (field.defaultValue === "true") input.checked = true;

    item.appendChild(input);
    item.appendChild(el("span", ROOT_CLASS + "__switch-track"));
    wrapper.appendChild(item);

    var addon = toCents(field.settings && field.settings.priceAddon);
    return function () {
      if (!input.checked) return { value: "", cents: 0 };
      return { value: "Yes", cents: addon };
    };
  };

  Renderer.prototype.renderHidden = function (field) {
    var settings = field.settings || {};
    var value = settings.hiddenValue || field.defaultValue || "";
    return function () {
      return { value: value, cents: 0, hidden: true };
    };
  };

  /** Returns a reader for the field's current value, or null when static. */
  Renderer.prototype.renderControl = function (field, wrapper) {
    switch (field.type) {
      case "DROPDOWN":
        return this.renderSelect(field, wrapper);
      case "RADIO_BUTTON":
      case "CHECKBOX":
        return this.renderChoiceList(field, wrapper);
      case "BUTTONS":
        return this.renderButtons(field, wrapper);
      case "SWITCH":
        return this.renderSwitch(field, wrapper);
      case "COLOR_SWATCHES":
      case "IMAGE_SWATCHES":
        return this.renderSwatches(field, wrapper);
      case "RANGE_SLIDER":
        return this.renderRange(field, wrapper);
      case "DATE_RANGE":
        return this.renderDateRange(field, wrapper);
      case "HIDDEN_FIELD":
        return this.renderHidden(field);
      default:
        return this.renderTextual(field, wrapper);
    }
  };

  Renderer.prototype.renderField = function (field, allFields, parent) {
    if (field.type === "GROUP") {
      var group = el("fieldset", ROOT_CLASS + "__group");
      if (field.label) {
        group.appendChild(el("legend", ROOT_CLASS + "__group-title", field.label));
      }
      if (field.description) {
        group.appendChild(el("p", ROOT_CLASS + "__description", field.description));
      }
      this.renderFields(allFields, field.id, group);
      parent.appendChild(group);
      return;
    }

    var wrapper = el("div", ROOT_CLASS + "__field");
    wrapper.setAttribute("data-product-options-field", field.id);
    if (field.cssClass) wrapper.classList.add(field.cssClass);
    if (field.hidden || field.type === "HIDDEN_FIELD") {
      wrapper.hidden = true;
    }

    if (isPresentational(field.type)) {
      this.renderStatic(field, wrapper);
      parent.appendChild(wrapper);
      return;
    }

    wrapper.appendChild(this.labelNode(field));
    if (field.tooltip) {
      var info = el("span", ROOT_CLASS + "__tooltip", field.tooltip);
      wrapper.appendChild(info);
    }
    if (field.description) {
      wrapper.appendChild(el("p", ROOT_CLASS + "__description", field.description));
    }

    var read = this.renderControl(field, wrapper);

    if (field.helpText) {
      wrapper.appendChild(el("p", ROOT_CLASS + "__help", field.helpText));
    }
    var error = el("p", ROOT_CLASS + "__error");
    error.hidden = true;
    wrapper.appendChild(error);

    parent.appendChild(wrapper);

    this.controls.push({
      field: field,
      wrapper: wrapper,
      error: error,
      read: read,
      propertyName: this.propertyNameFor(field),
      selectedValue: wrapper.querySelector("." + ROOT_CLASS + "__selected-value"),
    });
  };

  Renderer.prototype.propertyNameFor = function (field) {
    // Underscore-prefixed properties are hidden by Shopify, so they keep a
    // readable key for order exports and integrations.
    if (field.type === "HIDDEN_FIELD") {
      return uniquePropertyName(this.usedNames, "_" + field.label);
    }
    if (this.settings.cartDisplay === "value_only") {
      return uniqueBlankPropertyName(this.usedNames);
    }
    return uniquePropertyName(this.usedNames, field.label);
  };

  Renderer.prototype.renderFields = function (fields, parentId, parent) {
    var self = this;
    childrenOf(fields, parentId).forEach(function (field) {
      self.renderField(field, fields, parent);
    });
  };

  Renderer.prototype.render = function (optionSets) {
    var root = el("div", ROOT_CLASS);
    if (this.settings.accentColor) {
      root.style.setProperty("--product-options-accent", this.settings.accentColor);
    }

    if (this.settings.heading) {
      root.appendChild(el("h2", ROOT_CLASS + "__title", this.settings.heading));
    }

    var self = this;
    optionSets.forEach(function (optionSet) {
      self.renderFields(optionSet.fields, null, root);
    });

    if (this.settings.showTotal) {
      this.totalNode = el("div", ROOT_CLASS + "__total");
      this.totalNode.hidden = true;
      root.appendChild(this.totalNode);
    }

    return root;
  };

  /* ------------------------------------------------------------ behaviour */

  function Controller(context, form, root, renderer) {
    this.context = context;
    this.form = form;
    this.root = root;
    this.renderer = renderer;
  }

  Controller.prototype.collect = function () {
    return this.renderer.controls.map(function (control) {
      var result = control.read() || { value: "", cents: 0 };
      return {
        control: control,
        value: result.value || "",
        cents: result.cents || 0,
      };
    });
  };

  /**
   * Merging happens on the cart page long after the product form is gone, so
   * the line item carries the list of properties this app owns. The underscore
   * prefix keeps it hidden from shoppers.
   */
  Controller.prototype.ownedNamesProperty = function (entries) {
    if (this.renderer.settings.cartDisplay !== "merge_with_variant") return null;

    var names = entries
      .filter(function (entry) {
        return entry.value && entry.control.propertyName.charAt(0) !== "_";
      })
      .map(function (entry) {
        return entry.control.propertyName;
      });

    return names.length ? JSON.stringify(names) : null;
  };

  Controller.prototype.syncProperties = function () {
    var form = this.form;
    Array.prototype.slice
      .call(form.querySelectorAll("[data-product-options-property]"))
      .forEach(function (node) {
        node.remove();
      });

    function addHiddenInput(name, value) {
      var input = document.createElement("input");
      input.type = "hidden";
      input.name = "properties[" + name + "]";
      input.value = value;
      input.setAttribute("data-product-options-property", "");
      form.appendChild(input);
    }

    var entries = this.collect();
    var totalCents = 0;

    entries.forEach(function (entry) {
      totalCents += entry.cents;
      if (entry.control.selectedValue) {
        entry.control.selectedValue.textContent = entry.value || "";
        entry.control.selectedValue.hidden = !entry.value;
      }
      if (!entry.value) return;
      addHiddenInput(entry.control.propertyName, entry.value);
    });

    var owned = this.ownedNamesProperty(entries);
    if (owned) addHiddenInput(OWNED_NAMES_PROPERTY, owned);

    this.renderTotal(totalCents);
  };

  Controller.prototype.renderTotal = function (totalCents) {
    var node = this.renderer.totalNode;
    if (!node) return;

    if (!totalCents) {
      node.hidden = true;
      node.textContent = "";
      return;
    }
    node.hidden = false;
    node.textContent =
      "Options total: +" +
      formatMoney(totalCents, this.context.moneyFormat);
  };

  Controller.prototype.validate = function () {
    var valid = true;
    var firstInvalid = null;

    this.collect().forEach(function (entry) {
      var field = entry.control.field;
      var error = entry.control.error;
      var message = "";

      if (field.required && !entry.value) {
        message = field.customErrorMessage || field.label + " is required.";
      } else if (
        entry.value &&
        field.minLength != null &&
        entry.value.length < field.minLength
      ) {
        message =
          field.label + " must be at least " + field.minLength + " characters.";
      }

      error.textContent = message;
      error.hidden = !message;
      entry.control.wrapper.classList.toggle("has-error", Boolean(message));

      if (message) {
        valid = false;
        if (!firstInvalid) firstInvalid = entry.control.wrapper;
      }
    });

    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return valid;
  };

  /** Line item properties for a variant, or null when it is another product. */
  Controller.prototype.propertiesFor = function (variantId) {
    var input = this.form.querySelector('[name="id"]');
    var formVariantId = input ? String(input.value) : null;
    if (variantId && formVariantId && variantId !== formVariantId) return null;

    var entries = this.collect();
    var properties = {};
    entries.forEach(function (entry) {
      if (entry.value) properties[entry.control.propertyName] = entry.value;
    });

    var owned = this.ownedNamesProperty(entries);
    if (owned) properties[OWNED_NAMES_PROPERTY] = owned;

    return properties;
  };

  Controller.prototype.bind = function () {
    var self = this;

    this.root.addEventListener("change", function () {
      self.syncProperties();
    });
    this.root.addEventListener("input", function () {
      self.syncProperties();
    });

    // Capture phase so validation runs before the theme's own AJAX handler.
    this.form.addEventListener(
      "submit",
      function (event) {
        self.syncProperties();
        if (!self.validate()) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      true
    );

    // Themes that add to cart from a click handler never fire `submit`.
    this.form.addEventListener(
      "click",
      function (event) {
        var trigger = event.target.closest
          ? event.target.closest('[name="add"], button[type="submit"]')
          : null;
        if (!trigger) return;

        self.syncProperties();
        if (!self.validate()) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      true
    );

    registerPropertySource(this);
    this.syncProperties();
  };

  /* --------------------------------------------------- cart request patching
     Hidden inputs only survive when the theme serialises the whole product
     form. Many themes build their own `/cart/add` payload instead, so the
     request itself is patched as well. */

  var propertySources = [];
  var requestsPatched = false;

  function registerPropertySource(controller) {
    propertySources = propertySources.filter(function (source) {
      return document.documentElement.contains(source.form);
    });
    propertySources.push({ form: controller.form, controller: controller });
  }

  function collectProperties(variantId) {
    var merged = {};
    propertySources.forEach(function (source) {
      if (!document.documentElement.contains(source.form)) return;
      var properties = source.controller.propertiesFor(variantId);
      if (!properties) return;
      Object.keys(properties).forEach(function (name) {
        merged[name] = properties[name];
      });
    });
    return merged;
  }

  function isCartAddUrl(url) {
    return typeof url === "string" && url.indexOf("/cart/add") !== -1;
  }

  function injectIntoEntries(body) {
    var variantId = body.get("id");
    var properties = collectProperties(variantId ? String(variantId) : null);
    Object.keys(properties).forEach(function (name) {
      var key = "properties[" + name + "]";
      if (!body.has(key)) body.set(key, properties[name]);
    });
    return body;
  }

  function injectIntoPayload(payload) {
    if (!payload || typeof payload !== "object") return payload;

    var items = Array.isArray(payload.items) ? payload.items : [payload];
    items.forEach(function (item) {
      if (!item || typeof item !== "object") return;
      var properties = collectProperties(item.id != null ? String(item.id) : null);
      if (!Object.keys(properties).length) return;
      // Theme-supplied properties win so we never overwrite their data.
      item.properties = Object.assign({}, properties, item.properties || {});
    });
    return payload;
  }

  function transformBody(body) {
    if (typeof FormData !== "undefined" && body instanceof FormData) {
      return injectIntoEntries(body);
    }
    if (typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams) {
      return injectIntoEntries(body);
    }
    if (typeof body === "string") {
      var trimmed = body.trim();
      if (trimmed.charAt(0) === "{" || trimmed.charAt(0) === "[") {
        return JSON.stringify(injectIntoPayload(JSON.parse(body)));
      }
      return injectIntoEntries(new URLSearchParams(body)).toString();
    }
    return body;
  }

  function patchCartRequests() {
    if (requestsPatched) return;
    requestsPatched = true;

    var nativeFetch = window.fetch;
    if (typeof nativeFetch === "function") {
      window.fetch = function (input, init) {
        var url = typeof input === "string" ? input : (input && input.url) || "";
        if (!isCartAddUrl(url)) return nativeFetch.apply(this, arguments);

        if (init && init.body != null) {
          try {
            init.body = transformBody(init.body);
          } catch (error) {
            console.warn("[product-options] Could not patch cart request.", error);
          }
          return nativeFetch.apply(this, arguments);
        }

        var self = this;
        var args = arguments;
        if (
          typeof Request !== "undefined" &&
          input instanceof Request &&
          input.method !== "GET"
        ) {
          return input
            .clone()
            .text()
            .then(function (text) {
              return nativeFetch.call(
                self,
                new Request(input, { body: transformBody(text) })
              );
            })
            .catch(function () {
              return nativeFetch.apply(self, args);
            });
        }

        return nativeFetch.apply(self, args);
      };
    }

    if (typeof XMLHttpRequest !== "undefined") {
      var nativeOpen = XMLHttpRequest.prototype.open;
      var nativeSend = XMLHttpRequest.prototype.send;

      XMLHttpRequest.prototype.open = function (method, url) {
        this.__productOptionsUrl = url;
        return nativeOpen.apply(this, arguments);
      };

      XMLHttpRequest.prototype.send = function (body) {
        if (isCartAddUrl(this.__productOptionsUrl) && body != null) {
          try {
            return nativeSend.call(this, transformBody(body));
          } catch (error) {
            console.warn("[product-options] Could not patch cart request.", error);
          }
        }
        return nativeSend.apply(this, arguments);
      };
    }
  }

  /* ----------------------------------------------------------- cart merging
     The variant line ("Black, XS") is rendered by the theme, so option values
     can only join it on the client. Runs on the cart page and cart drawer;
     checkout is owned by Shopify and always lists properties separately. */

  var MERGE_MARKER = "data-product-options-merged";
  var HIDDEN_MARKER = "data-product-options-hidden";
  var LINE_CONTAINERS =
    "tr, li, .cart-item, [class*='cart-item'], [class*='cart__item'], [class*='line-item']";

  var applyingMerge = false;

  function normalizeText(value) {
    return (value || "").replace(/\s+/g, " ").trim();
  }

  function ownedNames(properties) {
    if (!properties || !properties[OWNED_NAMES_PROPERTY]) return [];
    try {
      var names = JSON.parse(properties[OWNED_NAMES_PROPERTY]);
      return Array.isArray(names) ? names : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Every element in `scope` whose whole text matches one of `texts`. The
   * options rendered on the product page are skipped: an option label there
   * reads exactly like the property name in the cart.
   */
  function collectByText(scope, texts) {
    var candidates = scope.querySelectorAll("*");
    var matches = [];

    for (var i = 0; i < candidates.length; i++) {
      var node = candidates[i];
      if (node.hasAttribute(HIDDEN_MARKER)) continue;
      if (node.closest("." + ROOT_CLASS)) continue;
      if (texts.indexOf(normalizeText(node.textContent)) === -1) continue;
      matches.push(node);
    }
    return matches;
  }

  function deepestOf(nodes) {
    var match = null;
    nodes.forEach(function (node) {
      if (!match || match.contains(node)) match = node;
    });
    return match;
  }

  /** Smallest element in `scope` whose text matches one of `texts`. */
  function findByText(scope, texts) {
    return deepestOf(collectByText(scope, texts));
  }

  function hideElement(node) {
    if (!node || node.hasAttribute(HIDDEN_MARKER)) return;
    node.setAttribute(HIDDEN_MARKER, "");
    node.style.display = "none";
  }

  /** Hides the theme's rendering of one property, whatever markup it uses. */
  function hideProperty(scope, name, value) {
    var label = normalizeText(name);
    var pairTexts = [
      normalizeText(name + ": " + value),
      normalizeText(name + ":" + value),
      normalizeText(name + " " + value),
    ];

    var pair = findByText(scope, pairTexts);
    if (pair) {
      hideElement(pair);
      return true;
    }

    var labelNode = findByText(scope, [label, label + ":"]);
    if (!labelNode) return false;

    var parent = labelNode.parentElement;
    if (parent && pairTexts.indexOf(normalizeText(parent.textContent)) !== -1) {
      hideElement(parent);
      return true;
    }

    hideElement(labelNode);
    var sibling = labelNode.nextElementSibling;
    if (sibling && normalizeText(sibling.textContent) === normalizeText(value)) {
      hideElement(sibling);
    }
    return true;
  }

  /** The element holding "Black, XS" for this line item. */
  function findVariantLine(scope, item) {
    var values = (item.options_with_values || [])
      .map(function (option) {
        return normalizeText(option.value);
      })
      .filter(function (value) {
        return value && value !== "Default Title";
      });
    if (!values.length) return null;

    var candidates = scope.querySelectorAll("*");
    var match = null;

    for (var i = 0; i < candidates.length; i++) {
      var node = candidates[i];
      if (node.hasAttribute(HIDDEN_MARKER)) continue;

      var text = normalizeText(node.textContent);
      if (text.length > 160) continue;

      var holdsAll = values.every(function (value) {
        return text.indexOf(value) !== -1;
      });
      if (!holdsAll) continue;
      if (!match || match.contains(node)) match = node;
    }
    return match;
  }

  function appendMergedValues(variantLine, values) {
    var suffix = ", " + values.join(", ");
    var existing = variantLine.querySelector("[" + MERGE_MARKER + "]");

    if (existing) {
      if (existing.textContent !== suffix) existing.textContent = suffix;
      return;
    }
    var span = document.createElement("span");
    span.setAttribute(MERGE_MARKER, "");
    span.textContent = suffix;
    variantLine.appendChild(span);
  }

  /** Locates a line item by the property text the theme rendered for it. */
  function findLineScope(item, names) {
    var texts = [];
    names.forEach(function (name) {
      var value = item.properties[name];
      if (!value) return;
      texts.push(normalizeText(name + ": " + value));
      texts.push(normalizeText(name + ":" + value));
      texts.push(normalizeText(name + " " + value));
    });
    if (!texts.length) return null;

    var matches = collectByText(document.body, texts);
    for (var i = matches.length - 1; i >= 0; i--) {
      var scope = matches[i].closest(LINE_CONTAINERS);
      if (scope) return scope;
    }
    return null;
  }

  function mergeLineItem(item) {
    var names = ownedNames(item.properties);
    if (!names.length) {
      debug("line skipped, no owned properties", item.key, item.properties);
      return;
    }

    var scope = findLineScope(item, names);
    if (!scope) {
      debug("line element not found for", names, item.properties);
      return;
    }

    var variantLine = findVariantLine(scope, item);
    // Without a variant line there is nothing to merge into, so the theme's
    // own rendering is left alone rather than hiding the values entirely.
    if (!variantLine) {
      debug("variant line not found in", scope);
      return;
    }

    var values = names
      .map(function (name) {
        return item.properties[name];
      })
      .filter(Boolean);
    if (!values.length) return;

    debug("merging", values, "into", variantLine);

    names.forEach(function (name) {
      if (item.properties[name]) hideProperty(scope, name, item.properties[name]);
    });
    appendMergedValues(variantLine, values);
  }

  function mergeCartLines() {
    if (applyingMerge) return;

    return fetch("/cart.js", {
      headers: { Accept: "application/json" },
      credentials: "same-origin",
    })
      .then(function (response) {
        return response.ok ? response.json() : null;
      })
      .then(function (cart) {
        if (!cart || !cart.items || !cart.items.length) return;
        debug("cart items", cart.items.length);

        applyingMerge = true;
        try {
          cart.items.forEach(mergeLineItem);
        } finally {
          // Let our own DOM writes settle before the observer listens again.
          setTimeout(function () {
            applyingMerge = false;
          }, 50);
        }
      })
      .catch(function (error) {
        console.warn("[product-options] Could not tidy cart lines.", error);
      });
  }

  var CART_CONTAINERS =
    "[class*='cart'], [id*='cart'], [class*='Cart'], [id*='Cart'], form[action*='/cart']";

  /** Ignores unrelated churn such as sliders so the cart is not re-fetched. */
  function touchesCart(mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var target = mutations[i].target;
      var node =
        target && target.nodeType === 1 ? target : target && target.parentElement;
      if (node && node.closest && node.closest(CART_CONTAINERS)) return true;
    }
    return false;
  }

  function watchCart() {
    var timer = null;

    new MutationObserver(function (mutations) {
      if (applyingMerge || !touchesCart(mutations)) return;
      clearTimeout(timer);
      timer = setTimeout(mergeCartLines, 200);
    }).observe(document.body, { childList: true, subtree: true });

    mergeCartLines();
  }

  /* ----------------------------------------------------------------- boot */

  function mount(root, form, placement) {
    var slot = document.querySelector(SLOT_SELECTOR);
    if (slot) {
      slot.innerHTML = "";
      slot.appendChild(root);
      return true;
    }
    if (placement === "app_block_only") return false;

    if (placement === "end_of_form") {
      form.appendChild(root);
      return true;
    }

    var anchor = findBuyButtonAnchor(form);
    if (!anchor) {
      form.appendChild(root);
      return true;
    }

    if (placement === "after_buy_buttons") {
      anchor.parentNode.insertBefore(root, anchor.nextSibling);
    } else {
      anchor.parentNode.insertBefore(root, anchor);
    }
    return true;
  }

  var cartWatchStarted = false;

  function init() {
    var context = readContext();
    if (!context) return;

    var settings = context.settings || {};
    debug("cart display mode:", settings.cartDisplay);

    if (settings.cartDisplay === "merge_with_variant" && !cartWatchStarted) {
      cartWatchStarted = true;
      watchCart();
    }

    if (!context.product || !context.product.id) return;

    var form = findProductForm();
    if (!form) return;

    if (form.querySelector("." + ROOT_CLASS)) return;

    patchCartRequests();

    fetchOptionSets(context)
      .then(function (payload) {
        var optionSets = payload.optionSets || [];
        if (!optionSets.length) return;

        applyDesign(payload.design);

        var renderer = new Renderer(context);
        var root = renderer.render(optionSets);
        if (!renderer.controls.length && !root.children.length) return;

        if (!mount(root, form, (context.settings || {}).placement)) return;

        new Controller(context, form, root, renderer).bind();
      })
      .catch(function (error) {
        console.warn("[product-options] Could not load options.", error);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  document.addEventListener("shopify:section:load", init);
})();
