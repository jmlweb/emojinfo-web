
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if (typeof $$scope.dirty === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function get_binding_group_value(group) {
        const value = [];
        for (let i = 0; i < group.length; i += 1) {
            if (group[i].checked)
                value.push(group[i].__value);
        }
        return value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let stylesheet;
    let active = 0;
    let current_rules = {};
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        if (!current_rules[name]) {
            if (!stylesheet) {
                const style = element('style');
                document.head.appendChild(style);
                stylesheet = style.sheet;
            }
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        node.style.animation = (node.style.animation || '')
            .split(', ')
            .filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        )
            .join(', ');
        if (name && !--active)
            clear_rules();
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            let i = stylesheet.cssRules.length;
            while (i--)
                stylesheet.deleteRule(i);
            current_rules = {};
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined' ? window : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.18.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function curry(fn, args = []) {
      return (..._args) => (rest => rest.length >= fn.length ? fn(...rest) : curry(fn, rest))([...args, ..._args]);
    }

    function anyPass(predicates) {
      return input => {
        let counter = 0;

        while (counter < predicates.length) {
          if (predicates[counter](input)) {
            return true;
          }

          counter++;
        }

        return false;
      };
    }

    function compose(...fns) {
      if (fns.length === 0) {
        throw new Error('compose requires at least one argument');
      }

      return (...args) => {
        const list = fns.slice();

        if (list.length > 0) {
          const fn = list.pop();
          let result = fn(...args);

          while (list.length > 0) {
            result = list.pop()(result);
          }

          return result;
        }
      };
    }

    function type(input) {
      const typeOf = typeof input;
      const asStr = input && input.toString ? input.toString() : '';

      if (input === null) {
        return 'Null';
      } else if (input === undefined) {
        return 'Undefined';
      } else if (typeOf === 'boolean') {
        return 'Boolean';
      } else if (typeOf === 'number') {
        return Number.isNaN(input) ? 'NaN' : 'Number';
      } else if (typeOf === 'string') {
        return 'String';
      } else if (Array.isArray(input)) {
        return 'Array';
      } else if (input instanceof RegExp) {
        return 'RegExp';
      }

      if (['true', 'false'].includes(asStr)) return 'Boolean';
      if (!Number.isNaN(Number(asStr))) return 'Number';
      if (asStr.startsWith('async')) return 'Async';
      if (asStr === '[object Promise]') return 'Promise';
      if (typeOf === 'function') return 'Function';
      if (input instanceof String) return 'String';
      return 'Object';
    }

    function parseError(maybeError) {
      const typeofError = maybeError.__proto__.toString();

      if (!['Error', 'TypeError'].includes(typeofError)) return [];
      return [typeofError, maybeError.message];
    }

    function parseDate(maybeDate) {
      if (!maybeDate.toDateString) return [false];
      return [true, maybeDate.getTime()];
    }

    function parseRegex(maybeRegex) {
      if (maybeRegex.constructor !== RegExp) return [false];
      return [true, maybeRegex.toString()];
    }

    function equals(a, b) {
      if (arguments.length === 1) return _b => equals(a, _b);
      const aType = type(a);
      if (aType !== type(b)) return false;
      if (['NaN', 'Undefined', 'Null'].includes(aType)) return true;
      if (['Boolean', 'Number', 'String'].includes(aType)) return a.toString() === b.toString();

      if (aType === 'Array') {
        const aClone = Array.from(a);
        const bClone = Array.from(b);

        if (aClone.toString() !== bClone.toString()) {
          return false;
        }

        let loopArrayFlag = true;
        aClone.forEach((aCloneInstance, aCloneIndex) => {
          if (loopArrayFlag) {
            if (aCloneInstance !== bClone[aCloneIndex] && !equals(aCloneInstance, bClone[aCloneIndex])) {
              loopArrayFlag = false;
            }
          }
        });
        return loopArrayFlag;
      }

      const aRegex = parseRegex(a);
      const bRegex = parseRegex(b);

      if (aRegex[0]) {
        return bRegex[0] ? aRegex[1] === bRegex[1] : false;
      } else if (bRegex[0]) return false;

      const aDate = parseDate(a);
      const bDate = parseDate(b);

      if (aDate[0]) {
        return bDate[0] ? aDate[1] === bDate[1] : false;
      } else if (bDate[0]) return false;

      const aError = parseError(a);
      const bError = parseError(b);

      if (aError[0]) {
        return bError[0] ? aError[0] === bError[0] && aError[1] === bError[1] : false;
      }

      if (aType === 'Object') {
        const aKeys = Object.keys(a);

        if (aKeys.length !== Object.keys(b).length) {
          return false;
        }

        let loopObjectFlag = true;
        aKeys.forEach(aKeyInstance => {
          if (loopObjectFlag) {
            const aValue = a[aKeyInstance];
            const bValue = b[aKeyInstance];

            if (aValue !== bValue && !equals(aValue, bValue)) {
              loopObjectFlag = false;
            }
          }
        });
        return loopObjectFlag;
      }

      return false;
    }

    function includes(target, list) {
      if (arguments.length === 1) return _input => includes(target, _input);

      if (typeof list === 'string') {
        return list.includes(target);
      }

      if (!Array.isArray(list)) return false;
      let index = -1;

      while (++index < list.length) {
        if (equals(list[index], target)) {
          return true;
        }
      }

      return false;
    }

    function filterObject(fn, obj) {
      const willReturn = {};

      for (const prop in obj) {
        if (fn(obj[prop], prop, obj)) {
          willReturn[prop] = obj[prop];
        }
      }

      return willReturn;
    }

    function filter(fn, list) {
      if (arguments.length === 1) return _list => filter(fn, _list);

      if (list == undefined) {
        return [];
      }

      if (!Array.isArray(list)) {
        return filterObject(fn, list);
      }

      let index = -1;
      let resIndex = 0;
      const len = list.length;
      const willReturn = [];

      while (++index < len) {
        const value = list[index];

        if (fn(value, index)) {
          willReturn[resIndex++] = value;
        }
      }

      return willReturn;
    }

    function mapObject(fn, obj) {
      const willReturn = {};

      for (const prop in obj) {
        willReturn[prop] = fn(obj[prop], prop, obj);
      }

      return willReturn;
    }

    function map(fn, list) {
      if (arguments.length === 1) return _list => map(fn, _list);

      if (list === undefined) {
        return [];
      }

      if (!Array.isArray(list)) {
        return mapObject(fn, list);
      }

      let index = -1;
      const len = list.length;
      const willReturn = Array(len);

      while (++index < len) {
        willReturn[index] = fn(list[index], index);
      }

      return willReturn;
    }

    function groupBy(fn, list) {
      if (arguments.length === 1) return _list => groupBy(fn, _list);
      const result = {};

      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        const key = fn(item);

        if (!result[key]) {
          result[key] = [];
        }

        result[key].push(item);
      }

      return result;
    }

    function join(separator, list) {
      if (arguments.length === 1) return _list => join(separator, _list);
      return list.join(separator);
    }

    function multiply(a, b) {
      if (arguments.length === 1) return _b => multiply(a, _b);
      return a * b;
    }

    function pipe(...fns) {
      if (fns.length === 0) throw new Error('pipe requires at least one argument');
      return compose(...fns.reverse());
    }

    function reduceFn(fn, acc, list) {
      return list.reduce(fn, acc);
    }

    const reduce = curry(reduceFn);

    const product = reduce(multiply, 1);

    function prop(key, obj) {
      if (arguments.length === 1) return _obj => prop(key, _obj);
      if (!obj) return undefined;
      return obj[key];
    }

    function toLower(str) {
      return str.toLowerCase();
    }

    function trim(str) {
      return str.trim();
    }

    const GENDERS = {
      female: 0,
      male: 1,
    };

    const MODES = {
      hierarchized: {
        title: 'Hierarchized',
        value: 'hierarchized',
      },
      categorized: {
        title: 'Categorized',
        value: 'categorized',
      },
      simple: {
        title: 'Simple',
        value: 'simple',
      },
    };

    function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

    function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

    function fetchFromCDN(path, version, options) {
      if (version === void 0) {
        version = 'latest';
      }

      if (options === void 0) {
        options = {};
      }

      {
        if (!path || path.slice(-5) !== '.json') {
          throw new Error('A valid JSON dataset is required to fetch.');
        }

        if (!version) {
          throw new Error('A valid release version is required.');
        }
      }

      var _options = options,
          _options$local = _options.local,
          local = _options$local === void 0 ? false : _options$local,
          opts = _objectWithoutPropertiesLoose(_options, ["local"]);

      var storage = local ? localStorage : sessionStorage;
      var cacheKey = "emojibase/" + version + "/" + path;
      var cachedData = storage.getItem(cacheKey);

      if (cachedData) {
        try {
          return Promise.resolve(JSON.parse(cachedData));
        } catch (error) {
          return Promise.resolve([]);
        }
      }

      return fetch("https://cdn.jsdelivr.net/npm/emojibase-data@" + version + "/" + path, _extends({
        credentials: 'omit',
        mode: 'cors',
        redirect: 'error'
      }, opts)).then(function (response) {
        if (!response.ok) {
          throw new Error('Failed to load Emojibase dataset.');
        }

        return response.json();
      }).then(function (data) {
        try {
          storage.setItem(cacheKey, JSON.stringify(data));
        } catch (error) {}

        return data;
      });
    }

    const fetchGroups = fetchFromCDN('meta/groups.json');
    const fetchData = fetchFromCDN('en/data.json');

    const emojiService = {
      fetch: () => Promise.all([fetchGroups, fetchData]),
    };

    const generateData = ({ hierarchy, groups, subgroups }, sourceData) => {
      if (!sourceData.length) {
        return sourceData
      }
      const groupedData = groupBy(prop('subgroup'), sourceData);
      return Object.keys(hierarchy).map(groupIndex => ({
        name: prop(groupIndex, groups),
        subgroups: prop(groupIndex, hierarchy).map(subgroupIndex => ({
          name: prop(subgroupIndex, subgroups),
          items: groupedData[Number(subgroupIndex)],
        })),
      }))
    };

    const setLocalItemIfNeeded = key => val => {
      if (val) {
        localStorage.setItem(key, val);
      }
    };

    /**
     * MODE
     */
    const storedMode = localStorage.getItem('mode');
    let mode = writable(storedMode || MODES.categorized.value);

    mode.subscribe(setLocalItemIfNeeded('mode'));

    /**
     * EMOJI SIZE
     */
    const DEFAULT_EMOJI_SIZE = 28;
    const storedEmojiSize = localStorage.getItem('emojiSize');
    let emojiSize = writable(
      storedEmojiSize ? Number(storedEmojiSize) : DEFAULT_EMOJI_SIZE
    );
    emojiSize.subscribe(setLocalItemIfNeeded('emojiSize'));

    /**
     * TONE
     */
    const storedTone = localStorage.getItem('tone');
    let tone = writable(storedTone ? Number(storedTone) : null);
    tone.subscribe(setLocalItemIfNeeded('tone'));

    let menuOpen = writable(false);
    let gender = writable(Object.values(GENDERS));
    let keyword = writable('');

    let selectedEmoji = writable(null);

    /**
     * DATA
     */
    const sourceData = readable(null, set => {
      emojiService.fetch().then(set);
    });

    const metadata = derived(sourceData, ($sourceData, set) => {
      if (!$sourceData) {
        set({});
      } else {
        const [metadata] = $sourceData;
        set(metadata);
      }
    });

    const groups = derived(metadata, ($metadata, set) => {
      set($metadata.groups);
    });

    const subgroups = derived(metadata, ($metadata, set) => {
      set($metadata.subgroups);
    });

    const emojiList = derived(sourceData, ($sourceData, set) => {
      if (!$sourceData) {
        set([]);
      } else {
        const [, emojiList] = $sourceData;
        set(emojiList);
      }
    });

    const filteredEmojiList = derived(
      [emojiList, keyword],
      ([$emojiList, $keyword], set) => {
        if (!$keyword) {
          set($emojiList);
        } else {
          const cleanKeyword = trim($keyword.toLowerCase());
          set(
            filter(
              anyPass([
                pipe(prop('emoji'), equals(cleanKeyword)),
                pipe(
                  prop('shortcodes'),
                  map(toLower),
                  join(', '),
                  includes(cleanKeyword)
                ),
                pipe(
                  prop('tags'),
                  map(toLower),
                  join(', '),
                  includes(cleanKeyword)
                ),
                pipe(prop('name'), toLower, includes(cleanKeyword)),
              ]),
              $emojiList
            )
          );
        }
      }
    );

    let data = derived(
      [metadata, filteredEmojiList],
      ([$metadata, $filteredEmojiList], set) => {
        set(generateData($metadata, $filteredEmojiList));
      }
    );

    const isLoading = derived([data, keyword], ([$data, $keyword], set) =>
      set(!$data.length && $keyword.length === 0)
    );
    const selectedEmojiData = derived(
      [emojiList, selectedEmoji],
      ([$emojiList, $selectedEmoji], set) => {
        if (!$selectedEmoji) {
          set(null);
        } else {
          const found = $emojiList.find(x => x.emoji === $selectedEmoji);
          if (found) {
            set(found);
          }
        }
      }
    );

    var store = {
      mode,
      data,
      isLoading,
      gender,
      emojiSize,
      menuOpen,
      tone,
      keyword,
      selectedEmoji,
      selectedEmojiData,
      groups,
      subgroups,
    };

    /* src/components/MainLayout.svelte generated by Svelte v3.18.2 */
    const file = "src/components/MainLayout.svelte";
    const get_footer_slot_changes = dirty => ({});
    const get_footer_slot_context = ctx => ({});
    const get_body_slot_changes = dirty => ({});
    const get_body_slot_context = ctx => ({});
    const get_top_slot_changes = dirty => ({});
    const get_top_slot_context = ctx => ({});

    function create_fragment(ctx) {
    	let div;
    	let t0;
    	let main;
    	let t1;
    	let current;
    	const top_slot_template = /*$$slots*/ ctx[3].top;
    	const top_slot = create_slot(top_slot_template, ctx, /*$$scope*/ ctx[2], get_top_slot_context);
    	const body_slot_template = /*$$slots*/ ctx[3].body;
    	const body_slot = create_slot(body_slot_template, ctx, /*$$scope*/ ctx[2], get_body_slot_context);
    	const footer_slot_template = /*$$slots*/ ctx[3].footer;
    	const footer_slot = create_slot(footer_slot_template, ctx, /*$$scope*/ ctx[2], get_footer_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (top_slot) top_slot.c();
    			t0 = space();
    			main = element("main");
    			if (body_slot) body_slot.c();
    			t1 = space();
    			if (footer_slot) footer_slot.c();
    			attr_dev(main, "class", "svelte-1wvmge9");
    			toggle_class(main, "loading", /*$isLoading*/ ctx[0]);
    			add_location(main, file, 8, 2, 156);
    			attr_dev(div, "class", "layout svelte-1wvmge9");
    			add_location(div, file, 6, 0, 106);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (top_slot) {
    				top_slot.m(div, null);
    			}

    			append_dev(div, t0);
    			append_dev(div, main);

    			if (body_slot) {
    				body_slot.m(main, null);
    			}

    			append_dev(div, t1);

    			if (footer_slot) {
    				footer_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (top_slot && top_slot.p && dirty & /*$$scope*/ 4) {
    				top_slot.p(get_slot_context(top_slot_template, ctx, /*$$scope*/ ctx[2], get_top_slot_context), get_slot_changes(top_slot_template, /*$$scope*/ ctx[2], dirty, get_top_slot_changes));
    			}

    			if (body_slot && body_slot.p && dirty & /*$$scope*/ 4) {
    				body_slot.p(get_slot_context(body_slot_template, ctx, /*$$scope*/ ctx[2], get_body_slot_context), get_slot_changes(body_slot_template, /*$$scope*/ ctx[2], dirty, get_body_slot_changes));
    			}

    			if (dirty & /*$isLoading*/ 1) {
    				toggle_class(main, "loading", /*$isLoading*/ ctx[0]);
    			}

    			if (footer_slot && footer_slot.p && dirty & /*$$scope*/ 4) {
    				footer_slot.p(get_slot_context(footer_slot_template, ctx, /*$$scope*/ ctx[2], get_footer_slot_context), get_slot_changes(footer_slot_template, /*$$scope*/ ctx[2], dirty, get_footer_slot_changes));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(top_slot, local);
    			transition_in(body_slot, local);
    			transition_in(footer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(top_slot, local);
    			transition_out(body_slot, local);
    			transition_out(footer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (top_slot) top_slot.d(detaching);
    			if (body_slot) body_slot.d(detaching);
    			if (footer_slot) footer_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $isLoading;
    	const { isLoading } = getContext("appState");
    	validate_store(isLoading, "isLoading");
    	component_subscribe($$self, isLoading, value => $$invalidate(0, $isLoading = value));
    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("$isLoading" in $$props) isLoading.set($isLoading = $$props.$isLoading);
    	};

    	return [$isLoading, isLoading, $$scope, $$slots];
    }

    class MainLayout extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MainLayout",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/components/TopBar/SearchIcon.svelte generated by Svelte v3.18.2 */

    const file$1 = "src/components/TopBar/SearchIcon.svelte";

    function create_fragment$1(ctx) {
    	let svg;
    	let g;
    	let path;
    	let defs;
    	let filter;
    	let feFlood;
    	let feColorMatrix0;
    	let feOffset;
    	let feGaussianBlur;
    	let feColorMatrix1;
    	let feBlend0;
    	let feBlend1;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path = svg_element("path");
    			defs = svg_element("defs");
    			filter = svg_element("filter");
    			feFlood = svg_element("feFlood");
    			feColorMatrix0 = svg_element("feColorMatrix");
    			feOffset = svg_element("feOffset");
    			feGaussianBlur = svg_element("feGaussianBlur");
    			feColorMatrix1 = svg_element("feColorMatrix");
    			feBlend0 = svg_element("feBlend");
    			feBlend1 = svg_element("feBlend");
    			attr_dev(path, "d", "M10.8566 19.7132C12.8216 19.7128 14.73 19.0549 16.2779 17.8444L21.1446\n      22.7111L22.71 21.1457L17.8433 16.279C19.0544 14.731 19.7127 12.8221\n      19.7132 10.8566C19.7132 5.97329 15.7399 2 10.8566 2C5.97328 2 2 5.97329 2\n      10.8566C2 15.7399 5.97328 19.7132 10.8566 19.7132ZM10.8566 4.21415C14.5199\n      4.21415 17.499 7.19328 17.499 10.8566C17.499 14.5199 14.5199 17.499\n      10.8566 17.499C7.19328 17.499 4.21414 14.5199 4.21414 10.8566C4.21414\n      7.19328 7.19328 4.21415 10.8566 4.21415Z");
    			attr_dev(path, "fill", "white");
    			add_location(path, file$1, 7, 4, 141);
    			attr_dev(g, "filter", "url(#filter0_d)");
    			add_location(g, file$1, 6, 2, 108);
    			attr_dev(feFlood, "flood-opacity", "0");
    			attr_dev(feFlood, "result", "BackgroundImageFix");
    			add_location(feFlood, file$1, 26, 6, 886);
    			attr_dev(feColorMatrix0, "in", "SourceAlpha");
    			attr_dev(feColorMatrix0, "type", "matrix");
    			attr_dev(feColorMatrix0, "values", "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0");
    			add_location(feColorMatrix0, file$1, 27, 6, 958);
    			attr_dev(feOffset, "dx", "2");
    			attr_dev(feOffset, "dy", "2");
    			add_location(feOffset, file$1, 31, 6, 1102);
    			attr_dev(feGaussianBlur, "stdDeviation", "2");
    			add_location(feGaussianBlur, file$1, 32, 6, 1144);
    			attr_dev(feColorMatrix1, "type", "matrix");
    			attr_dev(feColorMatrix1, "values", "0 0 0 0 0.113725 0 0 0 0 0.227451 0 0 0 0 0.384314 0 0 0 0.15 0");
    			add_location(feColorMatrix1, file$1, 33, 6, 1201);
    			attr_dev(feBlend0, "mode", "normal");
    			attr_dev(feBlend0, "in2", "BackgroundImageFix");
    			attr_dev(feBlend0, "result", "effect1_dropShadow");
    			add_location(feBlend0, file$1, 36, 6, 1342);
    			attr_dev(feBlend1, "mode", "normal");
    			attr_dev(feBlend1, "in", "SourceGraphic");
    			attr_dev(feBlend1, "in2", "effect1_dropShadow");
    			attr_dev(feBlend1, "result", "shape");
    			add_location(feBlend1, file$1, 40, 6, 1459);
    			attr_dev(filter, "id", "filter0_d");
    			attr_dev(filter, "x", "0");
    			attr_dev(filter, "y", "0");
    			attr_dev(filter, "width", "28.71");
    			attr_dev(filter, "height", "28.7111");
    			attr_dev(filter, "filterUnits", "userSpaceOnUse");
    			attr_dev(filter, "color-interpolation-filters", "sRGB");
    			add_location(filter, file$1, 18, 4, 707);
    			add_location(defs, file$1, 17, 2, 696);
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g);
    			append_dev(g, path);
    			append_dev(svg, defs);
    			append_dev(defs, filter);
    			append_dev(filter, feFlood);
    			append_dev(filter, feColorMatrix0);
    			append_dev(filter, feOffset);
    			append_dev(filter, feGaussianBlur);
    			append_dev(filter, feColorMatrix1);
    			append_dev(filter, feBlend0);
    			append_dev(filter, feBlend1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class SearchIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SearchIcon",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/components/TopBar/Search.svelte generated by Svelte v3.18.2 */
    const file$2 = "src/components/TopBar/Search.svelte";

    function create_fragment$2(ctx) {
    	let form;
    	let input;
    	let t;
    	let button;
    	let current;
    	let dispose;
    	const searchicon = new SearchIcon({ $$inline: true });

    	const block = {
    		c: function create() {
    			form = element("form");
    			input = element("input");
    			t = space();
    			button = element("button");
    			create_component(searchicon.$$.fragment);
    			attr_dev(input, "class", "input svelte-3e2faa");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Search emoji");
    			input.disabled = /*$isLoading*/ ctx[1];
    			attr_dev(input, "aria-label", "Search emoji");
    			add_location(input, file$2, 14, 2, 299);
    			attr_dev(button, "class", "button svelte-3e2faa");
    			attr_dev(button, "aria-label", "Do search");
    			toggle_class(button, "loading", /*$isLoading*/ ctx[1]);
    			add_location(button, file$2, 19, 2, 441);
    			attr_dev(form, "class", "box svelte-3e2faa");
    			add_location(form, file$2, 13, 0, 242);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, input);
    			set_input_value(input, /*value*/ ctx[0]);
    			append_dev(form, t);
    			append_dev(form, button);
    			mount_component(searchicon, button, null);
    			current = true;

    			dispose = [
    				listen_dev(input, "input", /*input_input_handler*/ ctx[6]),
    				listen_dev(button, "click", /*doSearch*/ ctx[4], false, false, false),
    				listen_dev(form, "submit", prevent_default(/*doSearch*/ ctx[4]), false, true, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$isLoading*/ 2) {
    				prop_dev(input, "disabled", /*$isLoading*/ ctx[1]);
    			}

    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}

    			if (dirty & /*$isLoading*/ 2) {
    				toggle_class(button, "loading", /*$isLoading*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(searchicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(searchicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			destroy_component(searchicon);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $keyword;
    	let $isLoading;
    	const { keyword, isLoading } = getContext("appState");
    	validate_store(keyword, "keyword");
    	component_subscribe($$self, keyword, value => $$invalidate(5, $keyword = value));
    	validate_store(isLoading, "isLoading");
    	component_subscribe($$self, isLoading, value => $$invalidate(1, $isLoading = value));
    	let value = $keyword;

    	const doSearch = () => {
    		keyword.set(value);
    	};

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("$keyword" in $$props) keyword.set($keyword = $$props.$keyword);
    		if ("$isLoading" in $$props) isLoading.set($isLoading = $$props.$isLoading);
    	};

    	return [value, $isLoading, keyword, isLoading, doSearch, $keyword, input_input_handler];
    }

    class Search extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Search",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function tick_spring(ctx, last_value, current_value, target_value) {
        if (typeof current_value === 'number' || is_date(current_value)) {
            // @ts-ignore
            const delta = target_value - current_value;
            // @ts-ignore
            const velocity = (current_value - last_value) / (ctx.dt || 1 / 60); // guard div by 0
            const spring = ctx.opts.stiffness * delta;
            const damper = ctx.opts.damping * velocity;
            const acceleration = (spring - damper) * ctx.inv_mass;
            const d = (velocity + acceleration) * ctx.dt;
            if (Math.abs(d) < ctx.opts.precision && Math.abs(delta) < ctx.opts.precision) {
                return target_value; // settled
            }
            else {
                ctx.settled = false; // signal loop to keep ticking
                // @ts-ignore
                return is_date(current_value) ?
                    new Date(current_value.getTime() + d) : current_value + d;
            }
        }
        else if (Array.isArray(current_value)) {
            // @ts-ignore
            return current_value.map((_, i) => tick_spring(ctx, last_value[i], current_value[i], target_value[i]));
        }
        else if (typeof current_value === 'object') {
            const next_value = {};
            for (const k in current_value)
                // @ts-ignore
                next_value[k] = tick_spring(ctx, last_value[k], current_value[k], target_value[k]);
            // @ts-ignore
            return next_value;
        }
        else {
            throw new Error(`Cannot spring ${typeof current_value} values`);
        }
    }
    function spring(value, opts = {}) {
        const store = writable(value);
        const { stiffness = 0.15, damping = 0.8, precision = 0.01 } = opts;
        let last_time;
        let task;
        let current_token;
        let last_value = value;
        let target_value = value;
        let inv_mass = 1;
        let inv_mass_recovery_rate = 0;
        let cancel_task = false;
        function set(new_value, opts = {}) {
            target_value = new_value;
            const token = current_token = {};
            if (value == null || opts.hard || (spring.stiffness >= 1 && spring.damping >= 1)) {
                cancel_task = true; // cancel any running animation
                last_time = now();
                last_value = new_value;
                store.set(value = target_value);
                return Promise.resolve();
            }
            else if (opts.soft) {
                const rate = opts.soft === true ? .5 : +opts.soft;
                inv_mass_recovery_rate = 1 / (rate * 60);
                inv_mass = 0; // infinite mass, unaffected by spring forces
            }
            if (!task) {
                last_time = now();
                cancel_task = false;
                task = loop(now => {
                    if (cancel_task) {
                        cancel_task = false;
                        task = null;
                        return false;
                    }
                    inv_mass = Math.min(inv_mass + inv_mass_recovery_rate, 1);
                    const ctx = {
                        inv_mass,
                        opts: spring,
                        settled: true,
                        dt: (now - last_time) * 60 / 1000
                    };
                    const next_value = tick_spring(ctx, last_value, value, target_value);
                    last_time = now;
                    last_value = value;
                    store.set(value = next_value);
                    if (ctx.settled)
                        task = null;
                    return !ctx.settled;
                });
            }
            return new Promise(fulfil => {
                task.promise.then(() => {
                    if (token === current_token)
                        fulfil();
                });
            });
        }
        const spring = {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe,
            stiffness,
            damping,
            precision
        };
        return spring;
    }

    /* src/components/TopBar/TriggerMenu.svelte generated by Svelte v3.18.2 */
    const file$3 = "src/components/TopBar/TriggerMenu.svelte";

    function create_fragment$3(ctx) {
    	let button;
    	let svg;
    	let rect0;
    	let rect0_x_value;
    	let rect0_y_value;
    	let rect0_transform_value;
    	let rect1;
    	let rect1_x_value;
    	let rect1_y_value;
    	let rect1_transform_value;
    	let rect2;
    	let rect2_x_value;
    	let rect2_y_value;
    	let rect2_transform_value;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			svg = svg_element("svg");
    			rect0 = svg_element("rect");
    			rect1 = svg_element("rect");
    			rect2 = svg_element("rect");
    			attr_dev(rect0, "x", rect0_x_value = /*$first*/ ctx[0].x);
    			attr_dev(rect0, "y", rect0_y_value = /*$first*/ ctx[0].y);
    			attr_dev(rect0, "width", "110");
    			attr_dev(rect0, "height", "22");
    			attr_dev(rect0, "transform", rect0_transform_value = `rotate(${/*$first*/ ctx[0].rotate} ${/*$first*/ ctx[0].x} ${/*$first*/ ctx[0].y})`);
    			attr_dev(rect0, "fill", "white");
    			add_location(rect0, file$3, 60, 4, 1088);
    			attr_dev(rect1, "x", rect1_x_value = /*$second*/ ctx[2].x);
    			attr_dev(rect1, "y", rect1_y_value = /*$second*/ ctx[2].y);
    			attr_dev(rect1, "width", "110");
    			attr_dev(rect1, "height", "22");
    			attr_dev(rect1, "transform", rect1_transform_value = `rotate(${/*$second*/ ctx[2].rotate} ${/*$second*/ ctx[2].x} ${/*$second*/ ctx[2].y})`);
    			attr_dev(rect1, "fill", "white");
    			add_location(rect1, file$3, 67, 4, 1274);
    			attr_dev(rect2, "x", rect2_x_value = /*$third*/ ctx[3].x);
    			attr_dev(rect2, "y", rect2_y_value = /*$third*/ ctx[3].y);
    			attr_dev(rect2, "width", "110");
    			attr_dev(rect2, "height", "22");
    			attr_dev(rect2, "transform", rect2_transform_value = `rotate(${/*$third*/ ctx[3].rotate} ${/*$third*/ ctx[3].x} ${/*$third*/ ctx[3].y})`);
    			attr_dev(rect2, "fill", "white");
    			add_location(rect2, file$3, 74, 4, 1465);
    			attr_dev(svg, "width", "18");
    			attr_dev(svg, "height", "18");
    			attr_dev(svg, "viewBox", "0 0 110 110");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "svelte-i5dnae");
    			add_location(svg, file$3, 54, 2, 966);
    			attr_dev(button, "aria-label", "Toggle menu");
    			attr_dev(button, "class", "svelte-i5dnae");
    			toggle_class(button, "open", /*$menuOpen*/ ctx[1]);
    			add_location(button, file$3, 53, 0, 888);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, svg);
    			append_dev(svg, rect0);
    			append_dev(svg, rect1);
    			append_dev(svg, rect2);
    			dispose = listen_dev(button, "click", /*efc*/ ctx[5], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$first*/ 1 && rect0_x_value !== (rect0_x_value = /*$first*/ ctx[0].x)) {
    				attr_dev(rect0, "x", rect0_x_value);
    			}

    			if (dirty & /*$first*/ 1 && rect0_y_value !== (rect0_y_value = /*$first*/ ctx[0].y)) {
    				attr_dev(rect0, "y", rect0_y_value);
    			}

    			if (dirty & /*$first*/ 1 && rect0_transform_value !== (rect0_transform_value = `rotate(${/*$first*/ ctx[0].rotate} ${/*$first*/ ctx[0].x} ${/*$first*/ ctx[0].y})`)) {
    				attr_dev(rect0, "transform", rect0_transform_value);
    			}

    			if (dirty & /*$second*/ 4 && rect1_x_value !== (rect1_x_value = /*$second*/ ctx[2].x)) {
    				attr_dev(rect1, "x", rect1_x_value);
    			}

    			if (dirty & /*$second*/ 4 && rect1_y_value !== (rect1_y_value = /*$second*/ ctx[2].y)) {
    				attr_dev(rect1, "y", rect1_y_value);
    			}

    			if (dirty & /*$second*/ 4 && rect1_transform_value !== (rect1_transform_value = `rotate(${/*$second*/ ctx[2].rotate} ${/*$second*/ ctx[2].x} ${/*$second*/ ctx[2].y})`)) {
    				attr_dev(rect1, "transform", rect1_transform_value);
    			}

    			if (dirty & /*$third*/ 8 && rect2_x_value !== (rect2_x_value = /*$third*/ ctx[3].x)) {
    				attr_dev(rect2, "x", rect2_x_value);
    			}

    			if (dirty & /*$third*/ 8 && rect2_y_value !== (rect2_y_value = /*$third*/ ctx[3].y)) {
    				attr_dev(rect2, "y", rect2_y_value);
    			}

    			if (dirty & /*$third*/ 8 && rect2_transform_value !== (rect2_transform_value = `rotate(${/*$third*/ ctx[3].rotate} ${/*$third*/ ctx[3].x} ${/*$third*/ ctx[3].y})`)) {
    				attr_dev(rect2, "transform", rect2_transform_value);
    			}

    			if (dirty & /*$menuOpen*/ 2) {
    				toggle_class(button, "open", /*$menuOpen*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $first;
    	let $menuOpen;
    	let $second;
    	let $third;
    	const { menuOpen, toggleMenu } = getContext("appState");
    	validate_store(menuOpen, "menuOpen");
    	component_subscribe($$self, menuOpen, value => $$invalidate(1, $menuOpen = value));

    	const efc = e => {
    		toggleMenu(e);
    	};

    	const springOpts = { stiffness: 0.04, damping: 0.3 };
    	const first = spring(null, springOpts);
    	validate_store(first, "first");
    	component_subscribe($$self, first, value => $$invalidate(0, $first = value));
    	const second = spring(null, springOpts);
    	validate_store(second, "second");
    	component_subscribe($$self, second, value => $$invalidate(2, $second = value));
    	const third = spring(null, springOpts);
    	validate_store(third, "third");
    	component_subscribe($$self, third, value => $$invalidate(3, $third = value));

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("$first" in $$props) first.set($first = $$props.$first);
    		if ("$menuOpen" in $$props) menuOpen.set($menuOpen = $$props.$menuOpen);
    		if ("$second" in $$props) second.set($second = $$props.$second);
    		if ("$third" in $$props) third.set($third = $$props.$third);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$menuOpen*/ 2) {
    			 set_store_value(first, $first = $menuOpen
    			? { x: 23.8873, y: 6.33093, rotate: 45 }
    			: { x: 0, y: 0, rotate: 0 });
    		}

    		if ($$self.$$.dirty & /*$menuOpen*/ 2) {
    			 set_store_value(second, $second = $menuOpen
    			? { x: 8.33093, y: 87.1127, rotate: -45 }
    			: { x: 0, y: 44, rotate: 0 });
    		}

    		if ($$self.$$.dirty & /*$menuOpen*/ 2) {
    			 set_store_value(third, $third = $menuOpen
    			? { x: 23.8873, y: 8.33093, rotate: 45 }
    			: { x: 0, y: 88, rotate: 0 });
    		}
    	};

    	return [$first, $menuOpen, $second, $third, menuOpen, efc, first, second, third];
    }

    class TriggerMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TriggerMenu",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/TopBar/TopBar.svelte generated by Svelte v3.18.2 */
    const file$4 = "src/components/TopBar/TopBar.svelte";

    function create_fragment$4(ctx) {
    	let header;
    	let div0;
    	let h1;
    	let t1;
    	let div1;
    	let t2;
    	let current;
    	const search = new Search({ $$inline: true });
    	const triggermenu = new TriggerMenu({ $$inline: true });

    	const block = {
    		c: function create() {
    			header = element("header");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "emojinf🎯";
    			t1 = space();
    			div1 = element("div");
    			create_component(search.$$.fragment);
    			t2 = space();
    			create_component(triggermenu.$$.fragment);
    			attr_dev(h1, "class", "logo svelte-hepeh2");
    			add_location(h1, file$4, 7, 4, 166);
    			attr_dev(div0, "class", "logo-wrapper");
    			add_location(div0, file$4, 6, 2, 135);
    			attr_dev(div1, "class", "search-wrapper svelte-hepeh2");
    			add_location(div1, file$4, 9, 2, 209);
    			attr_dev(header, "class", "top-bar svelte-hepeh2");
    			add_location(header, file$4, 5, 0, 108);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div0);
    			append_dev(div0, h1);
    			append_dev(header, t1);
    			append_dev(header, div1);
    			mount_component(search, div1, null);
    			append_dev(header, t2);
    			mount_component(triggermenu, header, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(search.$$.fragment, local);
    			transition_in(triggermenu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(search.$$.fragment, local);
    			transition_out(triggermenu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_component(search);
    			destroy_component(triggermenu);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class TopBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TopBar",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    const parseName = text =>
      text
        .toLowerCase()
        .split('-')
        .map(s => s.charAt(0).toUpperCase() + s.substring(1))
        .join(' & ');

    /**!
     * @fileOverview Kickass library to create and place poppers near their reference elements.
     * @version 1.16.1
     * @license
     * Copyright (c) 2016 Federico Zivolo and contributors
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     */
    var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined' && typeof navigator !== 'undefined';

    var timeoutDuration = function () {
      var longerTimeoutBrowsers = ['Edge', 'Trident', 'Firefox'];
      for (var i = 0; i < longerTimeoutBrowsers.length; i += 1) {
        if (isBrowser && navigator.userAgent.indexOf(longerTimeoutBrowsers[i]) >= 0) {
          return 1;
        }
      }
      return 0;
    }();

    function microtaskDebounce(fn) {
      var called = false;
      return function () {
        if (called) {
          return;
        }
        called = true;
        window.Promise.resolve().then(function () {
          called = false;
          fn();
        });
      };
    }

    function taskDebounce(fn) {
      var scheduled = false;
      return function () {
        if (!scheduled) {
          scheduled = true;
          setTimeout(function () {
            scheduled = false;
            fn();
          }, timeoutDuration);
        }
      };
    }

    var supportsMicroTasks = isBrowser && window.Promise;

    /**
    * Create a debounced version of a method, that's asynchronously deferred
    * but called in the minimum time possible.
    *
    * @method
    * @memberof Popper.Utils
    * @argument {Function} fn
    * @returns {Function}
    */
    var debounce = supportsMicroTasks ? microtaskDebounce : taskDebounce;

    /**
     * Check if the given variable is a function
     * @method
     * @memberof Popper.Utils
     * @argument {Any} functionToCheck - variable to check
     * @returns {Boolean} answer to: is a function?
     */
    function isFunction(functionToCheck) {
      var getType = {};
      return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    }

    /**
     * Get CSS computed property of the given element
     * @method
     * @memberof Popper.Utils
     * @argument {Eement} element
     * @argument {String} property
     */
    function getStyleComputedProperty(element, property) {
      if (element.nodeType !== 1) {
        return [];
      }
      // NOTE: 1 DOM access here
      var window = element.ownerDocument.defaultView;
      var css = window.getComputedStyle(element, null);
      return property ? css[property] : css;
    }

    /**
     * Returns the parentNode or the host of the element
     * @method
     * @memberof Popper.Utils
     * @argument {Element} element
     * @returns {Element} parent
     */
    function getParentNode(element) {
      if (element.nodeName === 'HTML') {
        return element;
      }
      return element.parentNode || element.host;
    }

    /**
     * Returns the scrolling parent of the given element
     * @method
     * @memberof Popper.Utils
     * @argument {Element} element
     * @returns {Element} scroll parent
     */
    function getScrollParent(element) {
      // Return body, `getScroll` will take care to get the correct `scrollTop` from it
      if (!element) {
        return document.body;
      }

      switch (element.nodeName) {
        case 'HTML':
        case 'BODY':
          return element.ownerDocument.body;
        case '#document':
          return element.body;
      }

      // Firefox want us to check `-x` and `-y` variations as well

      var _getStyleComputedProp = getStyleComputedProperty(element),
          overflow = _getStyleComputedProp.overflow,
          overflowX = _getStyleComputedProp.overflowX,
          overflowY = _getStyleComputedProp.overflowY;

      if (/(auto|scroll|overlay)/.test(overflow + overflowY + overflowX)) {
        return element;
      }

      return getScrollParent(getParentNode(element));
    }

    /**
     * Returns the reference node of the reference object, or the reference object itself.
     * @method
     * @memberof Popper.Utils
     * @param {Element|Object} reference - the reference element (the popper will be relative to this)
     * @returns {Element} parent
     */
    function getReferenceNode(reference) {
      return reference && reference.referenceNode ? reference.referenceNode : reference;
    }

    var isIE11 = isBrowser && !!(window.MSInputMethodContext && document.documentMode);
    var isIE10 = isBrowser && /MSIE 10/.test(navigator.userAgent);

    /**
     * Determines if the browser is Internet Explorer
     * @method
     * @memberof Popper.Utils
     * @param {Number} version to check
     * @returns {Boolean} isIE
     */
    function isIE(version) {
      if (version === 11) {
        return isIE11;
      }
      if (version === 10) {
        return isIE10;
      }
      return isIE11 || isIE10;
    }

    /**
     * Returns the offset parent of the given element
     * @method
     * @memberof Popper.Utils
     * @argument {Element} element
     * @returns {Element} offset parent
     */
    function getOffsetParent(element) {
      if (!element) {
        return document.documentElement;
      }

      var noOffsetParent = isIE(10) ? document.body : null;

      // NOTE: 1 DOM access here
      var offsetParent = element.offsetParent || null;
      // Skip hidden elements which don't have an offsetParent
      while (offsetParent === noOffsetParent && element.nextElementSibling) {
        offsetParent = (element = element.nextElementSibling).offsetParent;
      }

      var nodeName = offsetParent && offsetParent.nodeName;

      if (!nodeName || nodeName === 'BODY' || nodeName === 'HTML') {
        return element ? element.ownerDocument.documentElement : document.documentElement;
      }

      // .offsetParent will return the closest TH, TD or TABLE in case
      // no offsetParent is present, I hate this job...
      if (['TH', 'TD', 'TABLE'].indexOf(offsetParent.nodeName) !== -1 && getStyleComputedProperty(offsetParent, 'position') === 'static') {
        return getOffsetParent(offsetParent);
      }

      return offsetParent;
    }

    function isOffsetContainer(element) {
      var nodeName = element.nodeName;

      if (nodeName === 'BODY') {
        return false;
      }
      return nodeName === 'HTML' || getOffsetParent(element.firstElementChild) === element;
    }

    /**
     * Finds the root node (document, shadowDOM root) of the given element
     * @method
     * @memberof Popper.Utils
     * @argument {Element} node
     * @returns {Element} root node
     */
    function getRoot(node) {
      if (node.parentNode !== null) {
        return getRoot(node.parentNode);
      }

      return node;
    }

    /**
     * Finds the offset parent common to the two provided nodes
     * @method
     * @memberof Popper.Utils
     * @argument {Element} element1
     * @argument {Element} element2
     * @returns {Element} common offset parent
     */
    function findCommonOffsetParent(element1, element2) {
      // This check is needed to avoid errors in case one of the elements isn't defined for any reason
      if (!element1 || !element1.nodeType || !element2 || !element2.nodeType) {
        return document.documentElement;
      }

      // Here we make sure to give as "start" the element that comes first in the DOM
      var order = element1.compareDocumentPosition(element2) & Node.DOCUMENT_POSITION_FOLLOWING;
      var start = order ? element1 : element2;
      var end = order ? element2 : element1;

      // Get common ancestor container
      var range = document.createRange();
      range.setStart(start, 0);
      range.setEnd(end, 0);
      var commonAncestorContainer = range.commonAncestorContainer;

      // Both nodes are inside #document

      if (element1 !== commonAncestorContainer && element2 !== commonAncestorContainer || start.contains(end)) {
        if (isOffsetContainer(commonAncestorContainer)) {
          return commonAncestorContainer;
        }

        return getOffsetParent(commonAncestorContainer);
      }

      // one of the nodes is inside shadowDOM, find which one
      var element1root = getRoot(element1);
      if (element1root.host) {
        return findCommonOffsetParent(element1root.host, element2);
      } else {
        return findCommonOffsetParent(element1, getRoot(element2).host);
      }
    }

    /**
     * Gets the scroll value of the given element in the given side (top and left)
     * @method
     * @memberof Popper.Utils
     * @argument {Element} element
     * @argument {String} side `top` or `left`
     * @returns {number} amount of scrolled pixels
     */
    function getScroll(element) {
      var side = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'top';

      var upperSide = side === 'top' ? 'scrollTop' : 'scrollLeft';
      var nodeName = element.nodeName;

      if (nodeName === 'BODY' || nodeName === 'HTML') {
        var html = element.ownerDocument.documentElement;
        var scrollingElement = element.ownerDocument.scrollingElement || html;
        return scrollingElement[upperSide];
      }

      return element[upperSide];
    }

    /*
     * Sum or subtract the element scroll values (left and top) from a given rect object
     * @method
     * @memberof Popper.Utils
     * @param {Object} rect - Rect object you want to change
     * @param {HTMLElement} element - The element from the function reads the scroll values
     * @param {Boolean} subtract - set to true if you want to subtract the scroll values
     * @return {Object} rect - The modifier rect object
     */
    function includeScroll(rect, element) {
      var subtract = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      var scrollTop = getScroll(element, 'top');
      var scrollLeft = getScroll(element, 'left');
      var modifier = subtract ? -1 : 1;
      rect.top += scrollTop * modifier;
      rect.bottom += scrollTop * modifier;
      rect.left += scrollLeft * modifier;
      rect.right += scrollLeft * modifier;
      return rect;
    }

    /*
     * Helper to detect borders of a given element
     * @method
     * @memberof Popper.Utils
     * @param {CSSStyleDeclaration} styles
     * Result of `getStyleComputedProperty` on the given element
     * @param {String} axis - `x` or `y`
     * @return {number} borders - The borders size of the given axis
     */

    function getBordersSize(styles, axis) {
      var sideA = axis === 'x' ? 'Left' : 'Top';
      var sideB = sideA === 'Left' ? 'Right' : 'Bottom';

      return parseFloat(styles['border' + sideA + 'Width']) + parseFloat(styles['border' + sideB + 'Width']);
    }

    function getSize(axis, body, html, computedStyle) {
      return Math.max(body['offset' + axis], body['scroll' + axis], html['client' + axis], html['offset' + axis], html['scroll' + axis], isIE(10) ? parseInt(html['offset' + axis]) + parseInt(computedStyle['margin' + (axis === 'Height' ? 'Top' : 'Left')]) + parseInt(computedStyle['margin' + (axis === 'Height' ? 'Bottom' : 'Right')]) : 0);
    }

    function getWindowSizes(document) {
      var body = document.body;
      var html = document.documentElement;
      var computedStyle = isIE(10) && getComputedStyle(html);

      return {
        height: getSize('Height', body, html, computedStyle),
        width: getSize('Width', body, html, computedStyle)
      };
    }

    var classCallCheck = function (instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    };

    var createClass = function () {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();





    var defineProperty = function (obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }

      return obj;
    };

    var _extends$1 = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    /**
     * Given element offsets, generate an output similar to getBoundingClientRect
     * @method
     * @memberof Popper.Utils
     * @argument {Object} offsets
     * @returns {Object} ClientRect like output
     */
    function getClientRect(offsets) {
      return _extends$1({}, offsets, {
        right: offsets.left + offsets.width,
        bottom: offsets.top + offsets.height
      });
    }

    /**
     * Get bounding client rect of given element
     * @method
     * @memberof Popper.Utils
     * @param {HTMLElement} element
     * @return {Object} client rect
     */
    function getBoundingClientRect(element) {
      var rect = {};

      // IE10 10 FIX: Please, don't ask, the element isn't
      // considered in DOM in some circumstances...
      // This isn't reproducible in IE10 compatibility mode of IE11
      try {
        if (isIE(10)) {
          rect = element.getBoundingClientRect();
          var scrollTop = getScroll(element, 'top');
          var scrollLeft = getScroll(element, 'left');
          rect.top += scrollTop;
          rect.left += scrollLeft;
          rect.bottom += scrollTop;
          rect.right += scrollLeft;
        } else {
          rect = element.getBoundingClientRect();
        }
      } catch (e) {}

      var result = {
        left: rect.left,
        top: rect.top,
        width: rect.right - rect.left,
        height: rect.bottom - rect.top
      };

      // subtract scrollbar size from sizes
      var sizes = element.nodeName === 'HTML' ? getWindowSizes(element.ownerDocument) : {};
      var width = sizes.width || element.clientWidth || result.width;
      var height = sizes.height || element.clientHeight || result.height;

      var horizScrollbar = element.offsetWidth - width;
      var vertScrollbar = element.offsetHeight - height;

      // if an hypothetical scrollbar is detected, we must be sure it's not a `border`
      // we make this check conditional for performance reasons
      if (horizScrollbar || vertScrollbar) {
        var styles = getStyleComputedProperty(element);
        horizScrollbar -= getBordersSize(styles, 'x');
        vertScrollbar -= getBordersSize(styles, 'y');

        result.width -= horizScrollbar;
        result.height -= vertScrollbar;
      }

      return getClientRect(result);
    }

    function getOffsetRectRelativeToArbitraryNode(children, parent) {
      var fixedPosition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      var isIE10 = isIE(10);
      var isHTML = parent.nodeName === 'HTML';
      var childrenRect = getBoundingClientRect(children);
      var parentRect = getBoundingClientRect(parent);
      var scrollParent = getScrollParent(children);

      var styles = getStyleComputedProperty(parent);
      var borderTopWidth = parseFloat(styles.borderTopWidth);
      var borderLeftWidth = parseFloat(styles.borderLeftWidth);

      // In cases where the parent is fixed, we must ignore negative scroll in offset calc
      if (fixedPosition && isHTML) {
        parentRect.top = Math.max(parentRect.top, 0);
        parentRect.left = Math.max(parentRect.left, 0);
      }
      var offsets = getClientRect({
        top: childrenRect.top - parentRect.top - borderTopWidth,
        left: childrenRect.left - parentRect.left - borderLeftWidth,
        width: childrenRect.width,
        height: childrenRect.height
      });
      offsets.marginTop = 0;
      offsets.marginLeft = 0;

      // Subtract margins of documentElement in case it's being used as parent
      // we do this only on HTML because it's the only element that behaves
      // differently when margins are applied to it. The margins are included in
      // the box of the documentElement, in the other cases not.
      if (!isIE10 && isHTML) {
        var marginTop = parseFloat(styles.marginTop);
        var marginLeft = parseFloat(styles.marginLeft);

        offsets.top -= borderTopWidth - marginTop;
        offsets.bottom -= borderTopWidth - marginTop;
        offsets.left -= borderLeftWidth - marginLeft;
        offsets.right -= borderLeftWidth - marginLeft;

        // Attach marginTop and marginLeft because in some circumstances we may need them
        offsets.marginTop = marginTop;
        offsets.marginLeft = marginLeft;
      }

      if (isIE10 && !fixedPosition ? parent.contains(scrollParent) : parent === scrollParent && scrollParent.nodeName !== 'BODY') {
        offsets = includeScroll(offsets, parent);
      }

      return offsets;
    }

    function getViewportOffsetRectRelativeToArtbitraryNode(element) {
      var excludeScroll = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var html = element.ownerDocument.documentElement;
      var relativeOffset = getOffsetRectRelativeToArbitraryNode(element, html);
      var width = Math.max(html.clientWidth, window.innerWidth || 0);
      var height = Math.max(html.clientHeight, window.innerHeight || 0);

      var scrollTop = !excludeScroll ? getScroll(html) : 0;
      var scrollLeft = !excludeScroll ? getScroll(html, 'left') : 0;

      var offset = {
        top: scrollTop - relativeOffset.top + relativeOffset.marginTop,
        left: scrollLeft - relativeOffset.left + relativeOffset.marginLeft,
        width: width,
        height: height
      };

      return getClientRect(offset);
    }

    /**
     * Check if the given element is fixed or is inside a fixed parent
     * @method
     * @memberof Popper.Utils
     * @argument {Element} element
     * @argument {Element} customContainer
     * @returns {Boolean} answer to "isFixed?"
     */
    function isFixed(element) {
      var nodeName = element.nodeName;
      if (nodeName === 'BODY' || nodeName === 'HTML') {
        return false;
      }
      if (getStyleComputedProperty(element, 'position') === 'fixed') {
        return true;
      }
      var parentNode = getParentNode(element);
      if (!parentNode) {
        return false;
      }
      return isFixed(parentNode);
    }

    /**
     * Finds the first parent of an element that has a transformed property defined
     * @method
     * @memberof Popper.Utils
     * @argument {Element} element
     * @returns {Element} first transformed parent or documentElement
     */

    function getFixedPositionOffsetParent(element) {
      // This check is needed to avoid errors in case one of the elements isn't defined for any reason
      if (!element || !element.parentElement || isIE()) {
        return document.documentElement;
      }
      var el = element.parentElement;
      while (el && getStyleComputedProperty(el, 'transform') === 'none') {
        el = el.parentElement;
      }
      return el || document.documentElement;
    }

    /**
     * Computed the boundaries limits and return them
     * @method
     * @memberof Popper.Utils
     * @param {HTMLElement} popper
     * @param {HTMLElement} reference
     * @param {number} padding
     * @param {HTMLElement} boundariesElement - Element used to define the boundaries
     * @param {Boolean} fixedPosition - Is in fixed position mode
     * @returns {Object} Coordinates of the boundaries
     */
    function getBoundaries(popper, reference, padding, boundariesElement) {
      var fixedPosition = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

      // NOTE: 1 DOM access here

      var boundaries = { top: 0, left: 0 };
      var offsetParent = fixedPosition ? getFixedPositionOffsetParent(popper) : findCommonOffsetParent(popper, getReferenceNode(reference));

      // Handle viewport case
      if (boundariesElement === 'viewport') {
        boundaries = getViewportOffsetRectRelativeToArtbitraryNode(offsetParent, fixedPosition);
      } else {
        // Handle other cases based on DOM element used as boundaries
        var boundariesNode = void 0;
        if (boundariesElement === 'scrollParent') {
          boundariesNode = getScrollParent(getParentNode(reference));
          if (boundariesNode.nodeName === 'BODY') {
            boundariesNode = popper.ownerDocument.documentElement;
          }
        } else if (boundariesElement === 'window') {
          boundariesNode = popper.ownerDocument.documentElement;
        } else {
          boundariesNode = boundariesElement;
        }

        var offsets = getOffsetRectRelativeToArbitraryNode(boundariesNode, offsetParent, fixedPosition);

        // In case of HTML, we need a different computation
        if (boundariesNode.nodeName === 'HTML' && !isFixed(offsetParent)) {
          var _getWindowSizes = getWindowSizes(popper.ownerDocument),
              height = _getWindowSizes.height,
              width = _getWindowSizes.width;

          boundaries.top += offsets.top - offsets.marginTop;
          boundaries.bottom = height + offsets.top;
          boundaries.left += offsets.left - offsets.marginLeft;
          boundaries.right = width + offsets.left;
        } else {
          // for all the other DOM elements, this one is good
          boundaries = offsets;
        }
      }

      // Add paddings
      padding = padding || 0;
      var isPaddingNumber = typeof padding === 'number';
      boundaries.left += isPaddingNumber ? padding : padding.left || 0;
      boundaries.top += isPaddingNumber ? padding : padding.top || 0;
      boundaries.right -= isPaddingNumber ? padding : padding.right || 0;
      boundaries.bottom -= isPaddingNumber ? padding : padding.bottom || 0;

      return boundaries;
    }

    function getArea(_ref) {
      var width = _ref.width,
          height = _ref.height;

      return width * height;
    }

    /**
     * Utility used to transform the `auto` placement to the placement with more
     * available space.
     * @method
     * @memberof Popper.Utils
     * @argument {Object} data - The data object generated by update method
     * @argument {Object} options - Modifiers configuration and options
     * @returns {Object} The data object, properly modified
     */
    function computeAutoPlacement(placement, refRect, popper, reference, boundariesElement) {
      var padding = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;

      if (placement.indexOf('auto') === -1) {
        return placement;
      }

      var boundaries = getBoundaries(popper, reference, padding, boundariesElement);

      var rects = {
        top: {
          width: boundaries.width,
          height: refRect.top - boundaries.top
        },
        right: {
          width: boundaries.right - refRect.right,
          height: boundaries.height
        },
        bottom: {
          width: boundaries.width,
          height: boundaries.bottom - refRect.bottom
        },
        left: {
          width: refRect.left - boundaries.left,
          height: boundaries.height
        }
      };

      var sortedAreas = Object.keys(rects).map(function (key) {
        return _extends$1({
          key: key
        }, rects[key], {
          area: getArea(rects[key])
        });
      }).sort(function (a, b) {
        return b.area - a.area;
      });

      var filteredAreas = sortedAreas.filter(function (_ref2) {
        var width = _ref2.width,
            height = _ref2.height;
        return width >= popper.clientWidth && height >= popper.clientHeight;
      });

      var computedPlacement = filteredAreas.length > 0 ? filteredAreas[0].key : sortedAreas[0].key;

      var variation = placement.split('-')[1];

      return computedPlacement + (variation ? '-' + variation : '');
    }

    /**
     * Get offsets to the reference element
     * @method
     * @memberof Popper.Utils
     * @param {Object} state
     * @param {Element} popper - the popper element
     * @param {Element} reference - the reference element (the popper will be relative to this)
     * @param {Element} fixedPosition - is in fixed position mode
     * @returns {Object} An object containing the offsets which will be applied to the popper
     */
    function getReferenceOffsets(state, popper, reference) {
      var fixedPosition = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

      var commonOffsetParent = fixedPosition ? getFixedPositionOffsetParent(popper) : findCommonOffsetParent(popper, getReferenceNode(reference));
      return getOffsetRectRelativeToArbitraryNode(reference, commonOffsetParent, fixedPosition);
    }

    /**
     * Get the outer sizes of the given element (offset size + margins)
     * @method
     * @memberof Popper.Utils
     * @argument {Element} element
     * @returns {Object} object containing width and height properties
     */
    function getOuterSizes(element) {
      var window = element.ownerDocument.defaultView;
      var styles = window.getComputedStyle(element);
      var x = parseFloat(styles.marginTop || 0) + parseFloat(styles.marginBottom || 0);
      var y = parseFloat(styles.marginLeft || 0) + parseFloat(styles.marginRight || 0);
      var result = {
        width: element.offsetWidth + y,
        height: element.offsetHeight + x
      };
      return result;
    }

    /**
     * Get the opposite placement of the given one
     * @method
     * @memberof Popper.Utils
     * @argument {String} placement
     * @returns {String} flipped placement
     */
    function getOppositePlacement(placement) {
      var hash = { left: 'right', right: 'left', bottom: 'top', top: 'bottom' };
      return placement.replace(/left|right|bottom|top/g, function (matched) {
        return hash[matched];
      });
    }

    /**
     * Get offsets to the popper
     * @method
     * @memberof Popper.Utils
     * @param {Object} position - CSS position the Popper will get applied
     * @param {HTMLElement} popper - the popper element
     * @param {Object} referenceOffsets - the reference offsets (the popper will be relative to this)
     * @param {String} placement - one of the valid placement options
     * @returns {Object} popperOffsets - An object containing the offsets which will be applied to the popper
     */
    function getPopperOffsets(popper, referenceOffsets, placement) {
      placement = placement.split('-')[0];

      // Get popper node sizes
      var popperRect = getOuterSizes(popper);

      // Add position, width and height to our offsets object
      var popperOffsets = {
        width: popperRect.width,
        height: popperRect.height
      };

      // depending by the popper placement we have to compute its offsets slightly differently
      var isHoriz = ['right', 'left'].indexOf(placement) !== -1;
      var mainSide = isHoriz ? 'top' : 'left';
      var secondarySide = isHoriz ? 'left' : 'top';
      var measurement = isHoriz ? 'height' : 'width';
      var secondaryMeasurement = !isHoriz ? 'height' : 'width';

      popperOffsets[mainSide] = referenceOffsets[mainSide] + referenceOffsets[measurement] / 2 - popperRect[measurement] / 2;
      if (placement === secondarySide) {
        popperOffsets[secondarySide] = referenceOffsets[secondarySide] - popperRect[secondaryMeasurement];
      } else {
        popperOffsets[secondarySide] = referenceOffsets[getOppositePlacement(secondarySide)];
      }

      return popperOffsets;
    }

    /**
     * Mimics the `find` method of Array
     * @method
     * @memberof Popper.Utils
     * @argument {Array} arr
     * @argument prop
     * @argument value
     * @returns index or -1
     */
    function find(arr, check) {
      // use native find if supported
      if (Array.prototype.find) {
        return arr.find(check);
      }

      // use `filter` to obtain the same behavior of `find`
      return arr.filter(check)[0];
    }

    /**
     * Return the index of the matching object
     * @method
     * @memberof Popper.Utils
     * @argument {Array} arr
     * @argument prop
     * @argument value
     * @returns index or -1
     */
    function findIndex(arr, prop, value) {
      // use native findIndex if supported
      if (Array.prototype.findIndex) {
        return arr.findIndex(function (cur) {
          return cur[prop] === value;
        });
      }

      // use `find` + `indexOf` if `findIndex` isn't supported
      var match = find(arr, function (obj) {
        return obj[prop] === value;
      });
      return arr.indexOf(match);
    }

    /**
     * Loop trough the list of modifiers and run them in order,
     * each of them will then edit the data object.
     * @method
     * @memberof Popper.Utils
     * @param {dataObject} data
     * @param {Array} modifiers
     * @param {String} ends - Optional modifier name used as stopper
     * @returns {dataObject}
     */
    function runModifiers(modifiers, data, ends) {
      var modifiersToRun = ends === undefined ? modifiers : modifiers.slice(0, findIndex(modifiers, 'name', ends));

      modifiersToRun.forEach(function (modifier) {
        if (modifier['function']) {
          // eslint-disable-line dot-notation
          console.warn('`modifier.function` is deprecated, use `modifier.fn`!');
        }
        var fn = modifier['function'] || modifier.fn; // eslint-disable-line dot-notation
        if (modifier.enabled && isFunction(fn)) {
          // Add properties to offsets to make them a complete clientRect object
          // we do this before each modifier to make sure the previous one doesn't
          // mess with these values
          data.offsets.popper = getClientRect(data.offsets.popper);
          data.offsets.reference = getClientRect(data.offsets.reference);

          data = fn(data, modifier);
        }
      });

      return data;
    }

    /**
     * Updates the position of the popper, computing the new offsets and applying
     * the new style.<br />
     * Prefer `scheduleUpdate` over `update` because of performance reasons.
     * @method
     * @memberof Popper
     */
    function update$1() {
      // if popper is destroyed, don't perform any further update
      if (this.state.isDestroyed) {
        return;
      }

      var data = {
        instance: this,
        styles: {},
        arrowStyles: {},
        attributes: {},
        flipped: false,
        offsets: {}
      };

      // compute reference element offsets
      data.offsets.reference = getReferenceOffsets(this.state, this.popper, this.reference, this.options.positionFixed);

      // compute auto placement, store placement inside the data object,
      // modifiers will be able to edit `placement` if needed
      // and refer to originalPlacement to know the original value
      data.placement = computeAutoPlacement(this.options.placement, data.offsets.reference, this.popper, this.reference, this.options.modifiers.flip.boundariesElement, this.options.modifiers.flip.padding);

      // store the computed placement inside `originalPlacement`
      data.originalPlacement = data.placement;

      data.positionFixed = this.options.positionFixed;

      // compute the popper offsets
      data.offsets.popper = getPopperOffsets(this.popper, data.offsets.reference, data.placement);

      data.offsets.popper.position = this.options.positionFixed ? 'fixed' : 'absolute';

      // run the modifiers
      data = runModifiers(this.modifiers, data);

      // the first `update` will call `onCreate` callback
      // the other ones will call `onUpdate` callback
      if (!this.state.isCreated) {
        this.state.isCreated = true;
        this.options.onCreate(data);
      } else {
        this.options.onUpdate(data);
      }
    }

    /**
     * Helper used to know if the given modifier is enabled.
     * @method
     * @memberof Popper.Utils
     * @returns {Boolean}
     */
    function isModifierEnabled(modifiers, modifierName) {
      return modifiers.some(function (_ref) {
        var name = _ref.name,
            enabled = _ref.enabled;
        return enabled && name === modifierName;
      });
    }

    /**
     * Get the prefixed supported property name
     * @method
     * @memberof Popper.Utils
     * @argument {String} property (camelCase)
     * @returns {String} prefixed property (camelCase or PascalCase, depending on the vendor prefix)
     */
    function getSupportedPropertyName(property) {
      var prefixes = [false, 'ms', 'Webkit', 'Moz', 'O'];
      var upperProp = property.charAt(0).toUpperCase() + property.slice(1);

      for (var i = 0; i < prefixes.length; i++) {
        var prefix = prefixes[i];
        var toCheck = prefix ? '' + prefix + upperProp : property;
        if (typeof document.body.style[toCheck] !== 'undefined') {
          return toCheck;
        }
      }
      return null;
    }

    /**
     * Destroys the popper.
     * @method
     * @memberof Popper
     */
    function destroy() {
      this.state.isDestroyed = true;

      // touch DOM only if `applyStyle` modifier is enabled
      if (isModifierEnabled(this.modifiers, 'applyStyle')) {
        this.popper.removeAttribute('x-placement');
        this.popper.style.position = '';
        this.popper.style.top = '';
        this.popper.style.left = '';
        this.popper.style.right = '';
        this.popper.style.bottom = '';
        this.popper.style.willChange = '';
        this.popper.style[getSupportedPropertyName('transform')] = '';
      }

      this.disableEventListeners();

      // remove the popper if user explicitly asked for the deletion on destroy
      // do not use `remove` because IE11 doesn't support it
      if (this.options.removeOnDestroy) {
        this.popper.parentNode.removeChild(this.popper);
      }
      return this;
    }

    /**
     * Get the window associated with the element
     * @argument {Element} element
     * @returns {Window}
     */
    function getWindow(element) {
      var ownerDocument = element.ownerDocument;
      return ownerDocument ? ownerDocument.defaultView : window;
    }

    function attachToScrollParents(scrollParent, event, callback, scrollParents) {
      var isBody = scrollParent.nodeName === 'BODY';
      var target = isBody ? scrollParent.ownerDocument.defaultView : scrollParent;
      target.addEventListener(event, callback, { passive: true });

      if (!isBody) {
        attachToScrollParents(getScrollParent(target.parentNode), event, callback, scrollParents);
      }
      scrollParents.push(target);
    }

    /**
     * Setup needed event listeners used to update the popper position
     * @method
     * @memberof Popper.Utils
     * @private
     */
    function setupEventListeners(reference, options, state, updateBound) {
      // Resize event listener on window
      state.updateBound = updateBound;
      getWindow(reference).addEventListener('resize', state.updateBound, { passive: true });

      // Scroll event listener on scroll parents
      var scrollElement = getScrollParent(reference);
      attachToScrollParents(scrollElement, 'scroll', state.updateBound, state.scrollParents);
      state.scrollElement = scrollElement;
      state.eventsEnabled = true;

      return state;
    }

    /**
     * It will add resize/scroll events and start recalculating
     * position of the popper element when they are triggered.
     * @method
     * @memberof Popper
     */
    function enableEventListeners() {
      if (!this.state.eventsEnabled) {
        this.state = setupEventListeners(this.reference, this.options, this.state, this.scheduleUpdate);
      }
    }

    /**
     * Remove event listeners used to update the popper position
     * @method
     * @memberof Popper.Utils
     * @private
     */
    function removeEventListeners(reference, state) {
      // Remove resize event listener on window
      getWindow(reference).removeEventListener('resize', state.updateBound);

      // Remove scroll event listener on scroll parents
      state.scrollParents.forEach(function (target) {
        target.removeEventListener('scroll', state.updateBound);
      });

      // Reset state
      state.updateBound = null;
      state.scrollParents = [];
      state.scrollElement = null;
      state.eventsEnabled = false;
      return state;
    }

    /**
     * It will remove resize/scroll events and won't recalculate popper position
     * when they are triggered. It also won't trigger `onUpdate` callback anymore,
     * unless you call `update` method manually.
     * @method
     * @memberof Popper
     */
    function disableEventListeners() {
      if (this.state.eventsEnabled) {
        cancelAnimationFrame(this.scheduleUpdate);
        this.state = removeEventListeners(this.reference, this.state);
      }
    }

    /**
     * Tells if a given input is a number
     * @method
     * @memberof Popper.Utils
     * @param {*} input to check
     * @return {Boolean}
     */
    function isNumeric(n) {
      return n !== '' && !isNaN(parseFloat(n)) && isFinite(n);
    }

    /**
     * Set the style to the given popper
     * @method
     * @memberof Popper.Utils
     * @argument {Element} element - Element to apply the style to
     * @argument {Object} styles
     * Object with a list of properties and values which will be applied to the element
     */
    function setStyles(element, styles) {
      Object.keys(styles).forEach(function (prop) {
        var unit = '';
        // add unit if the value is numeric and is one of the following
        if (['width', 'height', 'top', 'right', 'bottom', 'left'].indexOf(prop) !== -1 && isNumeric(styles[prop])) {
          unit = 'px';
        }
        element.style[prop] = styles[prop] + unit;
      });
    }

    /**
     * Set the attributes to the given popper
     * @method
     * @memberof Popper.Utils
     * @argument {Element} element - Element to apply the attributes to
     * @argument {Object} styles
     * Object with a list of properties and values which will be applied to the element
     */
    function setAttributes(element, attributes) {
      Object.keys(attributes).forEach(function (prop) {
        var value = attributes[prop];
        if (value !== false) {
          element.setAttribute(prop, attributes[prop]);
        } else {
          element.removeAttribute(prop);
        }
      });
    }

    /**
     * @function
     * @memberof Modifiers
     * @argument {Object} data - The data object generated by `update` method
     * @argument {Object} data.styles - List of style properties - values to apply to popper element
     * @argument {Object} data.attributes - List of attribute properties - values to apply to popper element
     * @argument {Object} options - Modifiers configuration and options
     * @returns {Object} The same data object
     */
    function applyStyle(data) {
      // any property present in `data.styles` will be applied to the popper,
      // in this way we can make the 3rd party modifiers add custom styles to it
      // Be aware, modifiers could override the properties defined in the previous
      // lines of this modifier!
      setStyles(data.instance.popper, data.styles);

      // any property present in `data.attributes` will be applied to the popper,
      // they will be set as HTML attributes of the element
      setAttributes(data.instance.popper, data.attributes);

      // if arrowElement is defined and arrowStyles has some properties
      if (data.arrowElement && Object.keys(data.arrowStyles).length) {
        setStyles(data.arrowElement, data.arrowStyles);
      }

      return data;
    }

    /**
     * Set the x-placement attribute before everything else because it could be used
     * to add margins to the popper margins needs to be calculated to get the
     * correct popper offsets.
     * @method
     * @memberof Popper.modifiers
     * @param {HTMLElement} reference - The reference element used to position the popper
     * @param {HTMLElement} popper - The HTML element used as popper
     * @param {Object} options - Popper.js options
     */
    function applyStyleOnLoad(reference, popper, options, modifierOptions, state) {
      // compute reference element offsets
      var referenceOffsets = getReferenceOffsets(state, popper, reference, options.positionFixed);

      // compute auto placement, store placement inside the data object,
      // modifiers will be able to edit `placement` if needed
      // and refer to originalPlacement to know the original value
      var placement = computeAutoPlacement(options.placement, referenceOffsets, popper, reference, options.modifiers.flip.boundariesElement, options.modifiers.flip.padding);

      popper.setAttribute('x-placement', placement);

      // Apply `position` to popper before anything else because
      // without the position applied we can't guarantee correct computations
      setStyles(popper, { position: options.positionFixed ? 'fixed' : 'absolute' });

      return options;
    }

    /**
     * @function
     * @memberof Popper.Utils
     * @argument {Object} data - The data object generated by `update` method
     * @argument {Boolean} shouldRound - If the offsets should be rounded at all
     * @returns {Object} The popper's position offsets rounded
     *
     * The tale of pixel-perfect positioning. It's still not 100% perfect, but as
     * good as it can be within reason.
     * Discussion here: https://github.com/FezVrasta/popper.js/pull/715
     *
     * Low DPI screens cause a popper to be blurry if not using full pixels (Safari
     * as well on High DPI screens).
     *
     * Firefox prefers no rounding for positioning and does not have blurriness on
     * high DPI screens.
     *
     * Only horizontal placement and left/right values need to be considered.
     */
    function getRoundedOffsets(data, shouldRound) {
      var _data$offsets = data.offsets,
          popper = _data$offsets.popper,
          reference = _data$offsets.reference;
      var round = Math.round,
          floor = Math.floor;

      var noRound = function noRound(v) {
        return v;
      };

      var referenceWidth = round(reference.width);
      var popperWidth = round(popper.width);

      var isVertical = ['left', 'right'].indexOf(data.placement) !== -1;
      var isVariation = data.placement.indexOf('-') !== -1;
      var sameWidthParity = referenceWidth % 2 === popperWidth % 2;
      var bothOddWidth = referenceWidth % 2 === 1 && popperWidth % 2 === 1;

      var horizontalToInteger = !shouldRound ? noRound : isVertical || isVariation || sameWidthParity ? round : floor;
      var verticalToInteger = !shouldRound ? noRound : round;

      return {
        left: horizontalToInteger(bothOddWidth && !isVariation && shouldRound ? popper.left - 1 : popper.left),
        top: verticalToInteger(popper.top),
        bottom: verticalToInteger(popper.bottom),
        right: horizontalToInteger(popper.right)
      };
    }

    var isFirefox = isBrowser && /Firefox/i.test(navigator.userAgent);

    /**
     * @function
     * @memberof Modifiers
     * @argument {Object} data - The data object generated by `update` method
     * @argument {Object} options - Modifiers configuration and options
     * @returns {Object} The data object, properly modified
     */
    function computeStyle(data, options) {
      var x = options.x,
          y = options.y;
      var popper = data.offsets.popper;

      // Remove this legacy support in Popper.js v2

      var legacyGpuAccelerationOption = find(data.instance.modifiers, function (modifier) {
        return modifier.name === 'applyStyle';
      }).gpuAcceleration;
      if (legacyGpuAccelerationOption !== undefined) {
        console.warn('WARNING: `gpuAcceleration` option moved to `computeStyle` modifier and will not be supported in future versions of Popper.js!');
      }
      var gpuAcceleration = legacyGpuAccelerationOption !== undefined ? legacyGpuAccelerationOption : options.gpuAcceleration;

      var offsetParent = getOffsetParent(data.instance.popper);
      var offsetParentRect = getBoundingClientRect(offsetParent);

      // Styles
      var styles = {
        position: popper.position
      };

      var offsets = getRoundedOffsets(data, window.devicePixelRatio < 2 || !isFirefox);

      var sideA = x === 'bottom' ? 'top' : 'bottom';
      var sideB = y === 'right' ? 'left' : 'right';

      // if gpuAcceleration is set to `true` and transform is supported,
      //  we use `translate3d` to apply the position to the popper we
      // automatically use the supported prefixed version if needed
      var prefixedProperty = getSupportedPropertyName('transform');

      // now, let's make a step back and look at this code closely (wtf?)
      // If the content of the popper grows once it's been positioned, it
      // may happen that the popper gets misplaced because of the new content
      // overflowing its reference element
      // To avoid this problem, we provide two options (x and y), which allow
      // the consumer to define the offset origin.
      // If we position a popper on top of a reference element, we can set
      // `x` to `top` to make the popper grow towards its top instead of
      // its bottom.
      var left = void 0,
          top = void 0;
      if (sideA === 'bottom') {
        // when offsetParent is <html> the positioning is relative to the bottom of the screen (excluding the scrollbar)
        // and not the bottom of the html element
        if (offsetParent.nodeName === 'HTML') {
          top = -offsetParent.clientHeight + offsets.bottom;
        } else {
          top = -offsetParentRect.height + offsets.bottom;
        }
      } else {
        top = offsets.top;
      }
      if (sideB === 'right') {
        if (offsetParent.nodeName === 'HTML') {
          left = -offsetParent.clientWidth + offsets.right;
        } else {
          left = -offsetParentRect.width + offsets.right;
        }
      } else {
        left = offsets.left;
      }
      if (gpuAcceleration && prefixedProperty) {
        styles[prefixedProperty] = 'translate3d(' + left + 'px, ' + top + 'px, 0)';
        styles[sideA] = 0;
        styles[sideB] = 0;
        styles.willChange = 'transform';
      } else {
        // othwerise, we use the standard `top`, `left`, `bottom` and `right` properties
        var invertTop = sideA === 'bottom' ? -1 : 1;
        var invertLeft = sideB === 'right' ? -1 : 1;
        styles[sideA] = top * invertTop;
        styles[sideB] = left * invertLeft;
        styles.willChange = sideA + ', ' + sideB;
      }

      // Attributes
      var attributes = {
        'x-placement': data.placement
      };

      // Update `data` attributes, styles and arrowStyles
      data.attributes = _extends$1({}, attributes, data.attributes);
      data.styles = _extends$1({}, styles, data.styles);
      data.arrowStyles = _extends$1({}, data.offsets.arrow, data.arrowStyles);

      return data;
    }

    /**
     * Helper used to know if the given modifier depends from another one.<br />
     * It checks if the needed modifier is listed and enabled.
     * @method
     * @memberof Popper.Utils
     * @param {Array} modifiers - list of modifiers
     * @param {String} requestingName - name of requesting modifier
     * @param {String} requestedName - name of requested modifier
     * @returns {Boolean}
     */
    function isModifierRequired(modifiers, requestingName, requestedName) {
      var requesting = find(modifiers, function (_ref) {
        var name = _ref.name;
        return name === requestingName;
      });

      var isRequired = !!requesting && modifiers.some(function (modifier) {
        return modifier.name === requestedName && modifier.enabled && modifier.order < requesting.order;
      });

      if (!isRequired) {
        var _requesting = '`' + requestingName + '`';
        var requested = '`' + requestedName + '`';
        console.warn(requested + ' modifier is required by ' + _requesting + ' modifier in order to work, be sure to include it before ' + _requesting + '!');
      }
      return isRequired;
    }

    /**
     * @function
     * @memberof Modifiers
     * @argument {Object} data - The data object generated by update method
     * @argument {Object} options - Modifiers configuration and options
     * @returns {Object} The data object, properly modified
     */
    function arrow(data, options) {
      var _data$offsets$arrow;

      // arrow depends on keepTogether in order to work
      if (!isModifierRequired(data.instance.modifiers, 'arrow', 'keepTogether')) {
        return data;
      }

      var arrowElement = options.element;

      // if arrowElement is a string, suppose it's a CSS selector
      if (typeof arrowElement === 'string') {
        arrowElement = data.instance.popper.querySelector(arrowElement);

        // if arrowElement is not found, don't run the modifier
        if (!arrowElement) {
          return data;
        }
      } else {
        // if the arrowElement isn't a query selector we must check that the
        // provided DOM node is child of its popper node
        if (!data.instance.popper.contains(arrowElement)) {
          console.warn('WARNING: `arrow.element` must be child of its popper element!');
          return data;
        }
      }

      var placement = data.placement.split('-')[0];
      var _data$offsets = data.offsets,
          popper = _data$offsets.popper,
          reference = _data$offsets.reference;

      var isVertical = ['left', 'right'].indexOf(placement) !== -1;

      var len = isVertical ? 'height' : 'width';
      var sideCapitalized = isVertical ? 'Top' : 'Left';
      var side = sideCapitalized.toLowerCase();
      var altSide = isVertical ? 'left' : 'top';
      var opSide = isVertical ? 'bottom' : 'right';
      var arrowElementSize = getOuterSizes(arrowElement)[len];

      //
      // extends keepTogether behavior making sure the popper and its
      // reference have enough pixels in conjunction
      //

      // top/left side
      if (reference[opSide] - arrowElementSize < popper[side]) {
        data.offsets.popper[side] -= popper[side] - (reference[opSide] - arrowElementSize);
      }
      // bottom/right side
      if (reference[side] + arrowElementSize > popper[opSide]) {
        data.offsets.popper[side] += reference[side] + arrowElementSize - popper[opSide];
      }
      data.offsets.popper = getClientRect(data.offsets.popper);

      // compute center of the popper
      var center = reference[side] + reference[len] / 2 - arrowElementSize / 2;

      // Compute the sideValue using the updated popper offsets
      // take popper margin in account because we don't have this info available
      var css = getStyleComputedProperty(data.instance.popper);
      var popperMarginSide = parseFloat(css['margin' + sideCapitalized]);
      var popperBorderSide = parseFloat(css['border' + sideCapitalized + 'Width']);
      var sideValue = center - data.offsets.popper[side] - popperMarginSide - popperBorderSide;

      // prevent arrowElement from being placed not contiguously to its popper
      sideValue = Math.max(Math.min(popper[len] - arrowElementSize, sideValue), 0);

      data.arrowElement = arrowElement;
      data.offsets.arrow = (_data$offsets$arrow = {}, defineProperty(_data$offsets$arrow, side, Math.round(sideValue)), defineProperty(_data$offsets$arrow, altSide, ''), _data$offsets$arrow);

      return data;
    }

    /**
     * Get the opposite placement variation of the given one
     * @method
     * @memberof Popper.Utils
     * @argument {String} placement variation
     * @returns {String} flipped placement variation
     */
    function getOppositeVariation(variation) {
      if (variation === 'end') {
        return 'start';
      } else if (variation === 'start') {
        return 'end';
      }
      return variation;
    }

    /**
     * List of accepted placements to use as values of the `placement` option.<br />
     * Valid placements are:
     * - `auto`
     * - `top`
     * - `right`
     * - `bottom`
     * - `left`
     *
     * Each placement can have a variation from this list:
     * - `-start`
     * - `-end`
     *
     * Variations are interpreted easily if you think of them as the left to right
     * written languages. Horizontally (`top` and `bottom`), `start` is left and `end`
     * is right.<br />
     * Vertically (`left` and `right`), `start` is top and `end` is bottom.
     *
     * Some valid examples are:
     * - `top-end` (on top of reference, right aligned)
     * - `right-start` (on right of reference, top aligned)
     * - `bottom` (on bottom, centered)
     * - `auto-end` (on the side with more space available, alignment depends by placement)
     *
     * @static
     * @type {Array}
     * @enum {String}
     * @readonly
     * @method placements
     * @memberof Popper
     */
    var placements = ['auto-start', 'auto', 'auto-end', 'top-start', 'top', 'top-end', 'right-start', 'right', 'right-end', 'bottom-end', 'bottom', 'bottom-start', 'left-end', 'left', 'left-start'];

    // Get rid of `auto` `auto-start` and `auto-end`
    var validPlacements = placements.slice(3);

    /**
     * Given an initial placement, returns all the subsequent placements
     * clockwise (or counter-clockwise).
     *
     * @method
     * @memberof Popper.Utils
     * @argument {String} placement - A valid placement (it accepts variations)
     * @argument {Boolean} counter - Set to true to walk the placements counterclockwise
     * @returns {Array} placements including their variations
     */
    function clockwise(placement) {
      var counter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var index = validPlacements.indexOf(placement);
      var arr = validPlacements.slice(index + 1).concat(validPlacements.slice(0, index));
      return counter ? arr.reverse() : arr;
    }

    var BEHAVIORS = {
      FLIP: 'flip',
      CLOCKWISE: 'clockwise',
      COUNTERCLOCKWISE: 'counterclockwise'
    };

    /**
     * @function
     * @memberof Modifiers
     * @argument {Object} data - The data object generated by update method
     * @argument {Object} options - Modifiers configuration and options
     * @returns {Object} The data object, properly modified
     */
    function flip(data, options) {
      // if `inner` modifier is enabled, we can't use the `flip` modifier
      if (isModifierEnabled(data.instance.modifiers, 'inner')) {
        return data;
      }

      if (data.flipped && data.placement === data.originalPlacement) {
        // seems like flip is trying to loop, probably there's not enough space on any of the flippable sides
        return data;
      }

      var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, options.boundariesElement, data.positionFixed);

      var placement = data.placement.split('-')[0];
      var placementOpposite = getOppositePlacement(placement);
      var variation = data.placement.split('-')[1] || '';

      var flipOrder = [];

      switch (options.behavior) {
        case BEHAVIORS.FLIP:
          flipOrder = [placement, placementOpposite];
          break;
        case BEHAVIORS.CLOCKWISE:
          flipOrder = clockwise(placement);
          break;
        case BEHAVIORS.COUNTERCLOCKWISE:
          flipOrder = clockwise(placement, true);
          break;
        default:
          flipOrder = options.behavior;
      }

      flipOrder.forEach(function (step, index) {
        if (placement !== step || flipOrder.length === index + 1) {
          return data;
        }

        placement = data.placement.split('-')[0];
        placementOpposite = getOppositePlacement(placement);

        var popperOffsets = data.offsets.popper;
        var refOffsets = data.offsets.reference;

        // using floor because the reference offsets may contain decimals we are not going to consider here
        var floor = Math.floor;
        var overlapsRef = placement === 'left' && floor(popperOffsets.right) > floor(refOffsets.left) || placement === 'right' && floor(popperOffsets.left) < floor(refOffsets.right) || placement === 'top' && floor(popperOffsets.bottom) > floor(refOffsets.top) || placement === 'bottom' && floor(popperOffsets.top) < floor(refOffsets.bottom);

        var overflowsLeft = floor(popperOffsets.left) < floor(boundaries.left);
        var overflowsRight = floor(popperOffsets.right) > floor(boundaries.right);
        var overflowsTop = floor(popperOffsets.top) < floor(boundaries.top);
        var overflowsBottom = floor(popperOffsets.bottom) > floor(boundaries.bottom);

        var overflowsBoundaries = placement === 'left' && overflowsLeft || placement === 'right' && overflowsRight || placement === 'top' && overflowsTop || placement === 'bottom' && overflowsBottom;

        // flip the variation if required
        var isVertical = ['top', 'bottom'].indexOf(placement) !== -1;

        // flips variation if reference element overflows boundaries
        var flippedVariationByRef = !!options.flipVariations && (isVertical && variation === 'start' && overflowsLeft || isVertical && variation === 'end' && overflowsRight || !isVertical && variation === 'start' && overflowsTop || !isVertical && variation === 'end' && overflowsBottom);

        // flips variation if popper content overflows boundaries
        var flippedVariationByContent = !!options.flipVariationsByContent && (isVertical && variation === 'start' && overflowsRight || isVertical && variation === 'end' && overflowsLeft || !isVertical && variation === 'start' && overflowsBottom || !isVertical && variation === 'end' && overflowsTop);

        var flippedVariation = flippedVariationByRef || flippedVariationByContent;

        if (overlapsRef || overflowsBoundaries || flippedVariation) {
          // this boolean to detect any flip loop
          data.flipped = true;

          if (overlapsRef || overflowsBoundaries) {
            placement = flipOrder[index + 1];
          }

          if (flippedVariation) {
            variation = getOppositeVariation(variation);
          }

          data.placement = placement + (variation ? '-' + variation : '');

          // this object contains `position`, we want to preserve it along with
          // any additional property we may add in the future
          data.offsets.popper = _extends$1({}, data.offsets.popper, getPopperOffsets(data.instance.popper, data.offsets.reference, data.placement));

          data = runModifiers(data.instance.modifiers, data, 'flip');
        }
      });
      return data;
    }

    /**
     * @function
     * @memberof Modifiers
     * @argument {Object} data - The data object generated by update method
     * @argument {Object} options - Modifiers configuration and options
     * @returns {Object} The data object, properly modified
     */
    function keepTogether(data) {
      var _data$offsets = data.offsets,
          popper = _data$offsets.popper,
          reference = _data$offsets.reference;

      var placement = data.placement.split('-')[0];
      var floor = Math.floor;
      var isVertical = ['top', 'bottom'].indexOf(placement) !== -1;
      var side = isVertical ? 'right' : 'bottom';
      var opSide = isVertical ? 'left' : 'top';
      var measurement = isVertical ? 'width' : 'height';

      if (popper[side] < floor(reference[opSide])) {
        data.offsets.popper[opSide] = floor(reference[opSide]) - popper[measurement];
      }
      if (popper[opSide] > floor(reference[side])) {
        data.offsets.popper[opSide] = floor(reference[side]);
      }

      return data;
    }

    /**
     * Converts a string containing value + unit into a px value number
     * @function
     * @memberof {modifiers~offset}
     * @private
     * @argument {String} str - Value + unit string
     * @argument {String} measurement - `height` or `width`
     * @argument {Object} popperOffsets
     * @argument {Object} referenceOffsets
     * @returns {Number|String}
     * Value in pixels, or original string if no values were extracted
     */
    function toValue(str, measurement, popperOffsets, referenceOffsets) {
      // separate value from unit
      var split = str.match(/((?:\-|\+)?\d*\.?\d*)(.*)/);
      var value = +split[1];
      var unit = split[2];

      // If it's not a number it's an operator, I guess
      if (!value) {
        return str;
      }

      if (unit.indexOf('%') === 0) {
        var element = void 0;
        switch (unit) {
          case '%p':
            element = popperOffsets;
            break;
          case '%':
          case '%r':
          default:
            element = referenceOffsets;
        }

        var rect = getClientRect(element);
        return rect[measurement] / 100 * value;
      } else if (unit === 'vh' || unit === 'vw') {
        // if is a vh or vw, we calculate the size based on the viewport
        var size = void 0;
        if (unit === 'vh') {
          size = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        } else {
          size = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        }
        return size / 100 * value;
      } else {
        // if is an explicit pixel unit, we get rid of the unit and keep the value
        // if is an implicit unit, it's px, and we return just the value
        return value;
      }
    }

    /**
     * Parse an `offset` string to extrapolate `x` and `y` numeric offsets.
     * @function
     * @memberof {modifiers~offset}
     * @private
     * @argument {String} offset
     * @argument {Object} popperOffsets
     * @argument {Object} referenceOffsets
     * @argument {String} basePlacement
     * @returns {Array} a two cells array with x and y offsets in numbers
     */
    function parseOffset(offset, popperOffsets, referenceOffsets, basePlacement) {
      var offsets = [0, 0];

      // Use height if placement is left or right and index is 0 otherwise use width
      // in this way the first offset will use an axis and the second one
      // will use the other one
      var useHeight = ['right', 'left'].indexOf(basePlacement) !== -1;

      // Split the offset string to obtain a list of values and operands
      // The regex addresses values with the plus or minus sign in front (+10, -20, etc)
      var fragments = offset.split(/(\+|\-)/).map(function (frag) {
        return frag.trim();
      });

      // Detect if the offset string contains a pair of values or a single one
      // they could be separated by comma or space
      var divider = fragments.indexOf(find(fragments, function (frag) {
        return frag.search(/,|\s/) !== -1;
      }));

      if (fragments[divider] && fragments[divider].indexOf(',') === -1) {
        console.warn('Offsets separated by white space(s) are deprecated, use a comma (,) instead.');
      }

      // If divider is found, we divide the list of values and operands to divide
      // them by ofset X and Y.
      var splitRegex = /\s*,\s*|\s+/;
      var ops = divider !== -1 ? [fragments.slice(0, divider).concat([fragments[divider].split(splitRegex)[0]]), [fragments[divider].split(splitRegex)[1]].concat(fragments.slice(divider + 1))] : [fragments];

      // Convert the values with units to absolute pixels to allow our computations
      ops = ops.map(function (op, index) {
        // Most of the units rely on the orientation of the popper
        var measurement = (index === 1 ? !useHeight : useHeight) ? 'height' : 'width';
        var mergeWithPrevious = false;
        return op
        // This aggregates any `+` or `-` sign that aren't considered operators
        // e.g.: 10 + +5 => [10, +, +5]
        .reduce(function (a, b) {
          if (a[a.length - 1] === '' && ['+', '-'].indexOf(b) !== -1) {
            a[a.length - 1] = b;
            mergeWithPrevious = true;
            return a;
          } else if (mergeWithPrevious) {
            a[a.length - 1] += b;
            mergeWithPrevious = false;
            return a;
          } else {
            return a.concat(b);
          }
        }, [])
        // Here we convert the string values into number values (in px)
        .map(function (str) {
          return toValue(str, measurement, popperOffsets, referenceOffsets);
        });
      });

      // Loop trough the offsets arrays and execute the operations
      ops.forEach(function (op, index) {
        op.forEach(function (frag, index2) {
          if (isNumeric(frag)) {
            offsets[index] += frag * (op[index2 - 1] === '-' ? -1 : 1);
          }
        });
      });
      return offsets;
    }

    /**
     * @function
     * @memberof Modifiers
     * @argument {Object} data - The data object generated by update method
     * @argument {Object} options - Modifiers configuration and options
     * @argument {Number|String} options.offset=0
     * The offset value as described in the modifier description
     * @returns {Object} The data object, properly modified
     */
    function offset(data, _ref) {
      var offset = _ref.offset;
      var placement = data.placement,
          _data$offsets = data.offsets,
          popper = _data$offsets.popper,
          reference = _data$offsets.reference;

      var basePlacement = placement.split('-')[0];

      var offsets = void 0;
      if (isNumeric(+offset)) {
        offsets = [+offset, 0];
      } else {
        offsets = parseOffset(offset, popper, reference, basePlacement);
      }

      if (basePlacement === 'left') {
        popper.top += offsets[0];
        popper.left -= offsets[1];
      } else if (basePlacement === 'right') {
        popper.top += offsets[0];
        popper.left += offsets[1];
      } else if (basePlacement === 'top') {
        popper.left += offsets[0];
        popper.top -= offsets[1];
      } else if (basePlacement === 'bottom') {
        popper.left += offsets[0];
        popper.top += offsets[1];
      }

      data.popper = popper;
      return data;
    }

    /**
     * @function
     * @memberof Modifiers
     * @argument {Object} data - The data object generated by `update` method
     * @argument {Object} options - Modifiers configuration and options
     * @returns {Object} The data object, properly modified
     */
    function preventOverflow(data, options) {
      var boundariesElement = options.boundariesElement || getOffsetParent(data.instance.popper);

      // If offsetParent is the reference element, we really want to
      // go one step up and use the next offsetParent as reference to
      // avoid to make this modifier completely useless and look like broken
      if (data.instance.reference === boundariesElement) {
        boundariesElement = getOffsetParent(boundariesElement);
      }

      // NOTE: DOM access here
      // resets the popper's position so that the document size can be calculated excluding
      // the size of the popper element itself
      var transformProp = getSupportedPropertyName('transform');
      var popperStyles = data.instance.popper.style; // assignment to help minification
      var top = popperStyles.top,
          left = popperStyles.left,
          transform = popperStyles[transformProp];

      popperStyles.top = '';
      popperStyles.left = '';
      popperStyles[transformProp] = '';

      var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, boundariesElement, data.positionFixed);

      // NOTE: DOM access here
      // restores the original style properties after the offsets have been computed
      popperStyles.top = top;
      popperStyles.left = left;
      popperStyles[transformProp] = transform;

      options.boundaries = boundaries;

      var order = options.priority;
      var popper = data.offsets.popper;

      var check = {
        primary: function primary(placement) {
          var value = popper[placement];
          if (popper[placement] < boundaries[placement] && !options.escapeWithReference) {
            value = Math.max(popper[placement], boundaries[placement]);
          }
          return defineProperty({}, placement, value);
        },
        secondary: function secondary(placement) {
          var mainSide = placement === 'right' ? 'left' : 'top';
          var value = popper[mainSide];
          if (popper[placement] > boundaries[placement] && !options.escapeWithReference) {
            value = Math.min(popper[mainSide], boundaries[placement] - (placement === 'right' ? popper.width : popper.height));
          }
          return defineProperty({}, mainSide, value);
        }
      };

      order.forEach(function (placement) {
        var side = ['left', 'top'].indexOf(placement) !== -1 ? 'primary' : 'secondary';
        popper = _extends$1({}, popper, check[side](placement));
      });

      data.offsets.popper = popper;

      return data;
    }

    /**
     * @function
     * @memberof Modifiers
     * @argument {Object} data - The data object generated by `update` method
     * @argument {Object} options - Modifiers configuration and options
     * @returns {Object} The data object, properly modified
     */
    function shift(data) {
      var placement = data.placement;
      var basePlacement = placement.split('-')[0];
      var shiftvariation = placement.split('-')[1];

      // if shift shiftvariation is specified, run the modifier
      if (shiftvariation) {
        var _data$offsets = data.offsets,
            reference = _data$offsets.reference,
            popper = _data$offsets.popper;

        var isVertical = ['bottom', 'top'].indexOf(basePlacement) !== -1;
        var side = isVertical ? 'left' : 'top';
        var measurement = isVertical ? 'width' : 'height';

        var shiftOffsets = {
          start: defineProperty({}, side, reference[side]),
          end: defineProperty({}, side, reference[side] + reference[measurement] - popper[measurement])
        };

        data.offsets.popper = _extends$1({}, popper, shiftOffsets[shiftvariation]);
      }

      return data;
    }

    /**
     * @function
     * @memberof Modifiers
     * @argument {Object} data - The data object generated by update method
     * @argument {Object} options - Modifiers configuration and options
     * @returns {Object} The data object, properly modified
     */
    function hide(data) {
      if (!isModifierRequired(data.instance.modifiers, 'hide', 'preventOverflow')) {
        return data;
      }

      var refRect = data.offsets.reference;
      var bound = find(data.instance.modifiers, function (modifier) {
        return modifier.name === 'preventOverflow';
      }).boundaries;

      if (refRect.bottom < bound.top || refRect.left > bound.right || refRect.top > bound.bottom || refRect.right < bound.left) {
        // Avoid unnecessary DOM access if visibility hasn't changed
        if (data.hide === true) {
          return data;
        }

        data.hide = true;
        data.attributes['x-out-of-boundaries'] = '';
      } else {
        // Avoid unnecessary DOM access if visibility hasn't changed
        if (data.hide === false) {
          return data;
        }

        data.hide = false;
        data.attributes['x-out-of-boundaries'] = false;
      }

      return data;
    }

    /**
     * @function
     * @memberof Modifiers
     * @argument {Object} data - The data object generated by `update` method
     * @argument {Object} options - Modifiers configuration and options
     * @returns {Object} The data object, properly modified
     */
    function inner(data) {
      var placement = data.placement;
      var basePlacement = placement.split('-')[0];
      var _data$offsets = data.offsets,
          popper = _data$offsets.popper,
          reference = _data$offsets.reference;

      var isHoriz = ['left', 'right'].indexOf(basePlacement) !== -1;

      var subtractLength = ['top', 'left'].indexOf(basePlacement) === -1;

      popper[isHoriz ? 'left' : 'top'] = reference[basePlacement] - (subtractLength ? popper[isHoriz ? 'width' : 'height'] : 0);

      data.placement = getOppositePlacement(placement);
      data.offsets.popper = getClientRect(popper);

      return data;
    }

    /**
     * Modifier function, each modifier can have a function of this type assigned
     * to its `fn` property.<br />
     * These functions will be called on each update, this means that you must
     * make sure they are performant enough to avoid performance bottlenecks.
     *
     * @function ModifierFn
     * @argument {dataObject} data - The data object generated by `update` method
     * @argument {Object} options - Modifiers configuration and options
     * @returns {dataObject} The data object, properly modified
     */

    /**
     * Modifiers are plugins used to alter the behavior of your poppers.<br />
     * Popper.js uses a set of 9 modifiers to provide all the basic functionalities
     * needed by the library.
     *
     * Usually you don't want to override the `order`, `fn` and `onLoad` props.
     * All the other properties are configurations that could be tweaked.
     * @namespace modifiers
     */
    var modifiers = {
      /**
       * Modifier used to shift the popper on the start or end of its reference
       * element.<br />
       * It will read the variation of the `placement` property.<br />
       * It can be one either `-end` or `-start`.
       * @memberof modifiers
       * @inner
       */
      shift: {
        /** @prop {number} order=100 - Index used to define the order of execution */
        order: 100,
        /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
        enabled: true,
        /** @prop {ModifierFn} */
        fn: shift
      },

      /**
       * The `offset` modifier can shift your popper on both its axis.
       *
       * It accepts the following units:
       * - `px` or unit-less, interpreted as pixels
       * - `%` or `%r`, percentage relative to the length of the reference element
       * - `%p`, percentage relative to the length of the popper element
       * - `vw`, CSS viewport width unit
       * - `vh`, CSS viewport height unit
       *
       * For length is intended the main axis relative to the placement of the popper.<br />
       * This means that if the placement is `top` or `bottom`, the length will be the
       * `width`. In case of `left` or `right`, it will be the `height`.
       *
       * You can provide a single value (as `Number` or `String`), or a pair of values
       * as `String` divided by a comma or one (or more) white spaces.<br />
       * The latter is a deprecated method because it leads to confusion and will be
       * removed in v2.<br />
       * Additionally, it accepts additions and subtractions between different units.
       * Note that multiplications and divisions aren't supported.
       *
       * Valid examples are:
       * ```
       * 10
       * '10%'
       * '10, 10'
       * '10%, 10'
       * '10 + 10%'
       * '10 - 5vh + 3%'
       * '-10px + 5vh, 5px - 6%'
       * ```
       * > **NB**: If you desire to apply offsets to your poppers in a way that may make them overlap
       * > with their reference element, unfortunately, you will have to disable the `flip` modifier.
       * > You can read more on this at this [issue](https://github.com/FezVrasta/popper.js/issues/373).
       *
       * @memberof modifiers
       * @inner
       */
      offset: {
        /** @prop {number} order=200 - Index used to define the order of execution */
        order: 200,
        /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
        enabled: true,
        /** @prop {ModifierFn} */
        fn: offset,
        /** @prop {Number|String} offset=0
         * The offset value as described in the modifier description
         */
        offset: 0
      },

      /**
       * Modifier used to prevent the popper from being positioned outside the boundary.
       *
       * A scenario exists where the reference itself is not within the boundaries.<br />
       * We can say it has "escaped the boundaries" — or just "escaped".<br />
       * In this case we need to decide whether the popper should either:
       *
       * - detach from the reference and remain "trapped" in the boundaries, or
       * - if it should ignore the boundary and "escape with its reference"
       *
       * When `escapeWithReference` is set to`true` and reference is completely
       * outside its boundaries, the popper will overflow (or completely leave)
       * the boundaries in order to remain attached to the edge of the reference.
       *
       * @memberof modifiers
       * @inner
       */
      preventOverflow: {
        /** @prop {number} order=300 - Index used to define the order of execution */
        order: 300,
        /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
        enabled: true,
        /** @prop {ModifierFn} */
        fn: preventOverflow,
        /**
         * @prop {Array} [priority=['left','right','top','bottom']]
         * Popper will try to prevent overflow following these priorities by default,
         * then, it could overflow on the left and on top of the `boundariesElement`
         */
        priority: ['left', 'right', 'top', 'bottom'],
        /**
         * @prop {number} padding=5
         * Amount of pixel used to define a minimum distance between the boundaries
         * and the popper. This makes sure the popper always has a little padding
         * between the edges of its container
         */
        padding: 5,
        /**
         * @prop {String|HTMLElement} boundariesElement='scrollParent'
         * Boundaries used by the modifier. Can be `scrollParent`, `window`,
         * `viewport` or any DOM element.
         */
        boundariesElement: 'scrollParent'
      },

      /**
       * Modifier used to make sure the reference and its popper stay near each other
       * without leaving any gap between the two. Especially useful when the arrow is
       * enabled and you want to ensure that it points to its reference element.
       * It cares only about the first axis. You can still have poppers with margin
       * between the popper and its reference element.
       * @memberof modifiers
       * @inner
       */
      keepTogether: {
        /** @prop {number} order=400 - Index used to define the order of execution */
        order: 400,
        /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
        enabled: true,
        /** @prop {ModifierFn} */
        fn: keepTogether
      },

      /**
       * This modifier is used to move the `arrowElement` of the popper to make
       * sure it is positioned between the reference element and its popper element.
       * It will read the outer size of the `arrowElement` node to detect how many
       * pixels of conjunction are needed.
       *
       * It has no effect if no `arrowElement` is provided.
       * @memberof modifiers
       * @inner
       */
      arrow: {
        /** @prop {number} order=500 - Index used to define the order of execution */
        order: 500,
        /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
        enabled: true,
        /** @prop {ModifierFn} */
        fn: arrow,
        /** @prop {String|HTMLElement} element='[x-arrow]' - Selector or node used as arrow */
        element: '[x-arrow]'
      },

      /**
       * Modifier used to flip the popper's placement when it starts to overlap its
       * reference element.
       *
       * Requires the `preventOverflow` modifier before it in order to work.
       *
       * **NOTE:** this modifier will interrupt the current update cycle and will
       * restart it if it detects the need to flip the placement.
       * @memberof modifiers
       * @inner
       */
      flip: {
        /** @prop {number} order=600 - Index used to define the order of execution */
        order: 600,
        /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
        enabled: true,
        /** @prop {ModifierFn} */
        fn: flip,
        /**
         * @prop {String|Array} behavior='flip'
         * The behavior used to change the popper's placement. It can be one of
         * `flip`, `clockwise`, `counterclockwise` or an array with a list of valid
         * placements (with optional variations)
         */
        behavior: 'flip',
        /**
         * @prop {number} padding=5
         * The popper will flip if it hits the edges of the `boundariesElement`
         */
        padding: 5,
        /**
         * @prop {String|HTMLElement} boundariesElement='viewport'
         * The element which will define the boundaries of the popper position.
         * The popper will never be placed outside of the defined boundaries
         * (except if `keepTogether` is enabled)
         */
        boundariesElement: 'viewport',
        /**
         * @prop {Boolean} flipVariations=false
         * The popper will switch placement variation between `-start` and `-end` when
         * the reference element overlaps its boundaries.
         *
         * The original placement should have a set variation.
         */
        flipVariations: false,
        /**
         * @prop {Boolean} flipVariationsByContent=false
         * The popper will switch placement variation between `-start` and `-end` when
         * the popper element overlaps its reference boundaries.
         *
         * The original placement should have a set variation.
         */
        flipVariationsByContent: false
      },

      /**
       * Modifier used to make the popper flow toward the inner of the reference element.
       * By default, when this modifier is disabled, the popper will be placed outside
       * the reference element.
       * @memberof modifiers
       * @inner
       */
      inner: {
        /** @prop {number} order=700 - Index used to define the order of execution */
        order: 700,
        /** @prop {Boolean} enabled=false - Whether the modifier is enabled or not */
        enabled: false,
        /** @prop {ModifierFn} */
        fn: inner
      },

      /**
       * Modifier used to hide the popper when its reference element is outside of the
       * popper boundaries. It will set a `x-out-of-boundaries` attribute which can
       * be used to hide with a CSS selector the popper when its reference is
       * out of boundaries.
       *
       * Requires the `preventOverflow` modifier before it in order to work.
       * @memberof modifiers
       * @inner
       */
      hide: {
        /** @prop {number} order=800 - Index used to define the order of execution */
        order: 800,
        /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
        enabled: true,
        /** @prop {ModifierFn} */
        fn: hide
      },

      /**
       * Computes the style that will be applied to the popper element to gets
       * properly positioned.
       *
       * Note that this modifier will not touch the DOM, it just prepares the styles
       * so that `applyStyle` modifier can apply it. This separation is useful
       * in case you need to replace `applyStyle` with a custom implementation.
       *
       * This modifier has `850` as `order` value to maintain backward compatibility
       * with previous versions of Popper.js. Expect the modifiers ordering method
       * to change in future major versions of the library.
       *
       * @memberof modifiers
       * @inner
       */
      computeStyle: {
        /** @prop {number} order=850 - Index used to define the order of execution */
        order: 850,
        /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
        enabled: true,
        /** @prop {ModifierFn} */
        fn: computeStyle,
        /**
         * @prop {Boolean} gpuAcceleration=true
         * If true, it uses the CSS 3D transformation to position the popper.
         * Otherwise, it will use the `top` and `left` properties
         */
        gpuAcceleration: true,
        /**
         * @prop {string} [x='bottom']
         * Where to anchor the X axis (`bottom` or `top`). AKA X offset origin.
         * Change this if your popper should grow in a direction different from `bottom`
         */
        x: 'bottom',
        /**
         * @prop {string} [x='left']
         * Where to anchor the Y axis (`left` or `right`). AKA Y offset origin.
         * Change this if your popper should grow in a direction different from `right`
         */
        y: 'right'
      },

      /**
       * Applies the computed styles to the popper element.
       *
       * All the DOM manipulations are limited to this modifier. This is useful in case
       * you want to integrate Popper.js inside a framework or view library and you
       * want to delegate all the DOM manipulations to it.
       *
       * Note that if you disable this modifier, you must make sure the popper element
       * has its position set to `absolute` before Popper.js can do its work!
       *
       * Just disable this modifier and define your own to achieve the desired effect.
       *
       * @memberof modifiers
       * @inner
       */
      applyStyle: {
        /** @prop {number} order=900 - Index used to define the order of execution */
        order: 900,
        /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
        enabled: true,
        /** @prop {ModifierFn} */
        fn: applyStyle,
        /** @prop {Function} */
        onLoad: applyStyleOnLoad,
        /**
         * @deprecated since version 1.10.0, the property moved to `computeStyle` modifier
         * @prop {Boolean} gpuAcceleration=true
         * If true, it uses the CSS 3D transformation to position the popper.
         * Otherwise, it will use the `top` and `left` properties
         */
        gpuAcceleration: undefined
      }
    };

    /**
     * The `dataObject` is an object containing all the information used by Popper.js.
     * This object is passed to modifiers and to the `onCreate` and `onUpdate` callbacks.
     * @name dataObject
     * @property {Object} data.instance The Popper.js instance
     * @property {String} data.placement Placement applied to popper
     * @property {String} data.originalPlacement Placement originally defined on init
     * @property {Boolean} data.flipped True if popper has been flipped by flip modifier
     * @property {Boolean} data.hide True if the reference element is out of boundaries, useful to know when to hide the popper
     * @property {HTMLElement} data.arrowElement Node used as arrow by arrow modifier
     * @property {Object} data.styles Any CSS property defined here will be applied to the popper. It expects the JavaScript nomenclature (eg. `marginBottom`)
     * @property {Object} data.arrowStyles Any CSS property defined here will be applied to the popper arrow. It expects the JavaScript nomenclature (eg. `marginBottom`)
     * @property {Object} data.boundaries Offsets of the popper boundaries
     * @property {Object} data.offsets The measurements of popper, reference and arrow elements
     * @property {Object} data.offsets.popper `top`, `left`, `width`, `height` values
     * @property {Object} data.offsets.reference `top`, `left`, `width`, `height` values
     * @property {Object} data.offsets.arrow] `top` and `left` offsets, only one of them will be different from 0
     */

    /**
     * Default options provided to Popper.js constructor.<br />
     * These can be overridden using the `options` argument of Popper.js.<br />
     * To override an option, simply pass an object with the same
     * structure of the `options` object, as the 3rd argument. For example:
     * ```
     * new Popper(ref, pop, {
     *   modifiers: {
     *     preventOverflow: { enabled: false }
     *   }
     * })
     * ```
     * @type {Object}
     * @static
     * @memberof Popper
     */
    var Defaults = {
      /**
       * Popper's placement.
       * @prop {Popper.placements} placement='bottom'
       */
      placement: 'bottom',

      /**
       * Set this to true if you want popper to position it self in 'fixed' mode
       * @prop {Boolean} positionFixed=false
       */
      positionFixed: false,

      /**
       * Whether events (resize, scroll) are initially enabled.
       * @prop {Boolean} eventsEnabled=true
       */
      eventsEnabled: true,

      /**
       * Set to true if you want to automatically remove the popper when
       * you call the `destroy` method.
       * @prop {Boolean} removeOnDestroy=false
       */
      removeOnDestroy: false,

      /**
       * Callback called when the popper is created.<br />
       * By default, it is set to no-op.<br />
       * Access Popper.js instance with `data.instance`.
       * @prop {onCreate}
       */
      onCreate: function onCreate() {},

      /**
       * Callback called when the popper is updated. This callback is not called
       * on the initialization/creation of the popper, but only on subsequent
       * updates.<br />
       * By default, it is set to no-op.<br />
       * Access Popper.js instance with `data.instance`.
       * @prop {onUpdate}
       */
      onUpdate: function onUpdate() {},

      /**
       * List of modifiers used to modify the offsets before they are applied to the popper.
       * They provide most of the functionalities of Popper.js.
       * @prop {modifiers}
       */
      modifiers: modifiers
    };

    /**
     * @callback onCreate
     * @param {dataObject} data
     */

    /**
     * @callback onUpdate
     * @param {dataObject} data
     */

    // Utils
    // Methods
    var Popper = function () {
      /**
       * Creates a new Popper.js instance.
       * @class Popper
       * @param {Element|referenceObject} reference - The reference element used to position the popper
       * @param {Element} popper - The HTML / XML element used as the popper
       * @param {Object} options - Your custom options to override the ones defined in [Defaults](#defaults)
       * @return {Object} instance - The generated Popper.js instance
       */
      function Popper(reference, popper) {
        var _this = this;

        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        classCallCheck(this, Popper);

        this.scheduleUpdate = function () {
          return requestAnimationFrame(_this.update);
        };

        // make update() debounced, so that it only runs at most once-per-tick
        this.update = debounce(this.update.bind(this));

        // with {} we create a new object with the options inside it
        this.options = _extends$1({}, Popper.Defaults, options);

        // init state
        this.state = {
          isDestroyed: false,
          isCreated: false,
          scrollParents: []
        };

        // get reference and popper elements (allow jQuery wrappers)
        this.reference = reference && reference.jquery ? reference[0] : reference;
        this.popper = popper && popper.jquery ? popper[0] : popper;

        // Deep merge modifiers options
        this.options.modifiers = {};
        Object.keys(_extends$1({}, Popper.Defaults.modifiers, options.modifiers)).forEach(function (name) {
          _this.options.modifiers[name] = _extends$1({}, Popper.Defaults.modifiers[name] || {}, options.modifiers ? options.modifiers[name] : {});
        });

        // Refactoring modifiers' list (Object => Array)
        this.modifiers = Object.keys(this.options.modifiers).map(function (name) {
          return _extends$1({
            name: name
          }, _this.options.modifiers[name]);
        })
        // sort the modifiers by order
        .sort(function (a, b) {
          return a.order - b.order;
        });

        // modifiers have the ability to execute arbitrary code when Popper.js get inited
        // such code is executed in the same order of its modifier
        // they could add new properties to their options configuration
        // BE AWARE: don't add options to `options.modifiers.name` but to `modifierOptions`!
        this.modifiers.forEach(function (modifierOptions) {
          if (modifierOptions.enabled && isFunction(modifierOptions.onLoad)) {
            modifierOptions.onLoad(_this.reference, _this.popper, _this.options, modifierOptions, _this.state);
          }
        });

        // fire the first update to position the popper in the right place
        this.update();

        var eventsEnabled = this.options.eventsEnabled;
        if (eventsEnabled) {
          // setup event listeners, they will take care of update the position in specific situations
          this.enableEventListeners();
        }

        this.state.eventsEnabled = eventsEnabled;
      }

      // We can't use class properties because they don't get listed in the
      // class prototype and break stuff like Sinon stubs


      createClass(Popper, [{
        key: 'update',
        value: function update$$1() {
          return update$1.call(this);
        }
      }, {
        key: 'destroy',
        value: function destroy$$1() {
          return destroy.call(this);
        }
      }, {
        key: 'enableEventListeners',
        value: function enableEventListeners$$1() {
          return enableEventListeners.call(this);
        }
      }, {
        key: 'disableEventListeners',
        value: function disableEventListeners$$1() {
          return disableEventListeners.call(this);
        }

        /**
         * Schedules an update. It will run on the next UI update available.
         * @method scheduleUpdate
         * @memberof Popper
         */


        /**
         * Collection of utilities useful when writing custom modifiers.
         * Starting from version 1.7, this method is available only if you
         * include `popper-utils.js` before `popper.js`.
         *
         * **DEPRECATION**: This way to access PopperUtils is deprecated
         * and will be removed in v2! Use the PopperUtils module directly instead.
         * Due to the high instability of the methods contained in Utils, we can't
         * guarantee them to follow semver. Use them at your own risk!
         * @static
         * @private
         * @type {Object}
         * @deprecated since version 1.8
         * @member Utils
         * @memberof Popper
         */

      }]);
      return Popper;
    }();

    /**
     * The `referenceObject` is an object that provides an interface compatible with Popper.js
     * and lets you use it as replacement of a real DOM node.<br />
     * You can use this method to position a popper relatively to a set of coordinates
     * in case you don't have a DOM node to use as reference.
     *
     * ```
     * new Popper(referenceObject, popperNode);
     * ```
     *
     * NB: This feature isn't supported in Internet Explorer 10.
     * @name referenceObject
     * @property {Function} data.getBoundingClientRect
     * A function that returns a set of coordinates compatible with the native `getBoundingClientRect` method.
     * @property {number} data.clientWidth
     * An ES6 getter that will return the width of the virtual reference element.
     * @property {number} data.clientHeight
     * An ES6 getter that will return the height of the virtual reference element.
     */


    Popper.Utils = (typeof window !== 'undefined' ? window : global).PopperUtils;
    Popper.placements = placements;
    Popper.Defaults = Defaults;
    //# sourceMappingURL=popper.js.map

    /**!
    * tippy.js v5.2.1
    * (c) 2017-2020 atomiks
    * MIT License
    */

    function _extends$2() {
      _extends$2 = Object.assign || function (target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = arguments[i];

          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key];
            }
          }
        }

        return target;
      };

      return _extends$2.apply(this, arguments);
    }

    var version = "5.2.1";

    /**
     * Triggers reflow
     */
    function reflow(element) {
      void element.offsetHeight;
    }
    /**
     * Sets the innerHTML of an element
     */

    function setInnerHTML(element, html) {
      element[innerHTML()] = html;
    }
    /**
     * Determines if the value is a reference element
     */

    function isReferenceElement(value) {
      return !!(value && value._tippy && value._tippy.reference === value);
    }
    /**
     * Safe .hasOwnProperty check, for prototype-less objects
     */

    function hasOwnProperty(obj, key) {
      return {}.hasOwnProperty.call(obj, key);
    }
    /**
     * Returns an array of elements based on the value
     */

    function getArrayOfElements(value) {
      if (isElement(value)) {
        return [value];
      }

      if (isNodeList(value)) {
        return arrayFrom(value);
      }

      if (Array.isArray(value)) {
        return value;
      }

      return arrayFrom(document.querySelectorAll(value));
    }
    /**
     * Returns a value at a given index depending on if it's an array or number
     */

    function getValueAtIndexOrReturn(value, index, defaultValue) {
      if (Array.isArray(value)) {
        var v = value[index];
        return v == null ? Array.isArray(defaultValue) ? defaultValue[index] : defaultValue : v;
      }

      return value;
    }
    /**
     * Prevents errors from being thrown while accessing nested modifier objects
     * in `popperOptions`
     */

    function getModifier(obj, key) {
      return obj && obj.modifiers && obj.modifiers[key];
    }
    /**
     * Determines if the value is of type
     */

    function isType(value, type) {
      var str = {}.toString.call(value);
      return str.indexOf('[object') === 0 && str.indexOf(type + "]") > -1;
    }
    /**
     * Determines if the value is of type Element
     */

    function isElement(value) {
      return isType(value, 'Element');
    }
    /**
     * Determines if the value is of type NodeList
     */

    function isNodeList(value) {
      return isType(value, 'NodeList');
    }
    /**
     * Determines if the value is of type MouseEvent
     */

    function isMouseEvent(value) {
      return isType(value, 'MouseEvent');
    }
    /**
     * Firefox extensions don't allow setting .innerHTML directly, this will trick
     * it
     */

    function innerHTML() {
      return 'innerHTML';
    }
    /**
     * Evaluates a function if one, or returns the value
     */

    function invokeWithArgsOrReturn(value, args) {
      return typeof value === 'function' ? value.apply(void 0, args) : value;
    }
    /**
     * Sets a popperInstance modifier's property to a value
     */

    function setModifierValue(modifiers, name, property, value) {
      modifiers.filter(function (m) {
        return m.name === name;
      })[0][property] = value;
    }
    /**
     * Returns a new `div` element
     */

    function div() {
      return document.createElement('div');
    }
    /**
     * Applies a transition duration to a list of elements
     */

    function setTransitionDuration(els, value) {
      els.forEach(function (el) {
        if (el) {
          el.style.transitionDuration = value + "ms";
        }
      });
    }
    /**
     * Sets the visibility state to elements so they can begin to transition
     */

    function setVisibilityState(els, state) {
      els.forEach(function (el) {
        if (el) {
          el.setAttribute('data-state', state);
        }
      });
    }
    /**
     * Debounce utility. To avoid bloating bundle size, we're only passing 1
     * argument here, a more generic function would pass all arguments. Only
     * `onMouseMove` uses this which takes the event object for now.
     */

    function debounce$1(fn, ms) {
      // Avoid wrapping in `setTimeout` if ms is 0 anyway
      if (ms === 0) {
        return fn;
      }

      var timeout;
      return function (arg) {
        clearTimeout(timeout);
        timeout = setTimeout(function () {
          fn(arg);
        }, ms);
      };
    }
    /**
     * Preserves the original function invocation when another function replaces it
     */

    function preserveInvocation(originalFn, currentFn, args) {
      if (originalFn && originalFn !== currentFn) {
        originalFn.apply(void 0, args);
      }
    }
    /**
     * Deletes properties from an object (pure)
     */

    function removeProperties(obj, keys) {
      var clone = _extends$2({}, obj);

      keys.forEach(function (key) {
        delete clone[key];
      });
      return clone;
    }
    /**
     * Ponyfill for Array.from - converts iterable values to an array
     */

    function arrayFrom(value) {
      return [].slice.call(value);
    }
    /**
     * Works like Element.prototype.closest, but uses a callback instead
     */

    function closestCallback(element, callback) {
      while (element) {
        if (callback(element)) {
          return element;
        }

        element = element.parentElement;
      }

      return null;
    }
    /**
     * Determines if an array or string includes a string
     */

    function includes$1(a, b) {
      return a.indexOf(b) > -1;
    }
    /**
     * Creates an array from string of values separated by whitespace
     */

    function splitBySpaces(value) {
      return value.split(/\s+/).filter(Boolean);
    }
    /**
     * Returns the `nextValue` if `nextValue` is not `undefined`, otherwise returns
     * `currentValue`
     */

    function useIfDefined(nextValue, currentValue) {
      return nextValue !== undefined ? nextValue : currentValue;
    }
    /**
     * Converts a value that's an array or single value to an array
     */

    function normalizeToArray(value) {
      return [].concat(value);
    }
    /**
     * Returns the ownerDocument of the first available element, otherwise global
     * document
     */

    function getOwnerDocument(elementOrElements) {
      var _normalizeToArray = normalizeToArray(elementOrElements),
          element = _normalizeToArray[0];

      return element ? element.ownerDocument || document : document;
    }
    /**
     * Adds item to array if array does not contain it
     */

    function pushIfUnique(arr, value) {
      if (arr.indexOf(value) === -1) {
        arr.push(value);
      }
    }
    /**
     * Adds `px` if value is a number, or returns it directly
     */

    function appendPxIfNumber(value) {
      return typeof value === 'number' ? value + "px" : value;
    }
    /**
     * Filters out duplicate elements in an array
     */

    function unique(arr) {
      return arr.filter(function (item, index) {
        return arr.indexOf(item) === index;
      });
    }
    /**
     * Returns number from number or CSS units string
     */

    function getNumber(value) {
      return typeof value === 'number' ? value : parseFloat(value);
    }
    /**
     * Gets number or CSS string units in pixels (e.g. `1rem` -> 16)
     */

    function getUnitsInPx(doc, value) {
      var isRem = typeof value === 'string' && includes$1(value, 'rem');
      var html = doc.documentElement;
      var rootFontSize = 16;

      if (html && isRem) {
        return parseFloat(getComputedStyle(html).fontSize || String(rootFontSize)) * getNumber(value);
      }

      return getNumber(value);
    }
    /**
     * Adds the `distancePx` value to the placement of a Popper.Padding object
     */

    function getComputedPadding(basePlacement, padding, distancePx) {
      if (padding === void 0) {
        padding = 5;
      }

      var freshPaddingObject = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      };
      var keys = Object.keys(freshPaddingObject);
      return keys.reduce(function (obj, key) {
        obj[key] = typeof padding === 'number' ? padding : padding[key];

        if (basePlacement === key) {
          obj[key] = typeof padding === 'number' ? padding + distancePx : padding[basePlacement] + distancePx;
        }

        return obj;
      }, freshPaddingObject);
    }

    function createMemoryLeakWarning(method) {
      var txt = method === 'destroy' ? 'n already-' : ' ';
      return "\n    " + method + "() was called on a" + txt + "destroyed instance. This is a no-op but\n    indicates a potential memory leak.\n  ";
    }
    function clean(value) {
      var spacesAndTabs = /[ \t]{2,}/g;
      var lineStartWithSpaces = /^[ \t]*/gm;
      return value.replace(spacesAndTabs, ' ').replace(lineStartWithSpaces, '').trim();
    }

    function getDevMessage(message) {
      return clean("\n  %ctippy.js\n\n  %c" + clean(message) + "\n\n  %c\uD83D\uDC77\u200D This is a development-only message. It will be removed in production.\n  ");
    }

    function getFormattedMessage(message) {
      return [getDevMessage(message), // title
      'color: #00C584; font-size: 1.3em; font-weight: bold;', // message
      'line-height: 1.5', // footer
      'color: #a6a095;'];
    }
    /**
     * Helpful wrapper around `console.warn()`.
     * TODO: Should we use a cache so it only warns a single time and not spam the
     * console? (Need to consider hot reloading and invalidation though). Chrome
     * already batches warnings as well.
     */

    function warnWhen(condition, message) {
      if (condition) {
        var _console;

        (_console = console).warn.apply(_console, getFormattedMessage(message));
      }
    }
    /**
     * Helpful wrapper around `console.error()`
     */

    function errorWhen(condition, message) {
      if (condition) {
        var _console2;

        (_console2 = console).error.apply(_console2, getFormattedMessage(message));
      }
    }
    /**
     * Validates the `targets` value passed to `tippy()`
     */

    function validateTargets(targets) {
      var didPassFalsyValue = !targets;
      var didPassPlainObject = Object.prototype.toString.call(targets) === '[object Object]' && !targets.addEventListener;
      errorWhen(didPassFalsyValue, ['tippy() was passed', '`' + String(targets) + '`', 'as its targets (first) argument. Valid types are: String, Element, Element[],', 'or NodeList.'].join(' '));
      errorWhen(didPassPlainObject, ['tippy() was passed a plain object which is no longer supported as an argument.', 'See: https://atomiks.github.io/tippyjs/misc/#custom-position'].join(' '));
    }

    var pluginProps = {
      animateFill: false,
      followCursor: false,
      inlinePositioning: false,
      sticky: false
    };
    var defaultProps = _extends$2({
      allowHTML: true,
      animation: 'fade',
      appendTo: function appendTo() {
        return document.body;
      },
      aria: 'describedby',
      arrow: true,
      boundary: 'scrollParent',
      content: '',
      delay: 0,
      distance: 10,
      duration: [300, 250],
      flip: true,
      flipBehavior: 'flip',
      flipOnUpdate: false,
      hideOnClick: true,
      ignoreAttributes: false,
      inertia: false,
      interactive: false,
      interactiveBorder: 2,
      interactiveDebounce: 0,
      lazy: true,
      maxWidth: 350,
      multiple: false,
      offset: 0,
      onAfterUpdate: function onAfterUpdate() {},
      onBeforeUpdate: function onBeforeUpdate() {},
      onCreate: function onCreate() {},
      onDestroy: function onDestroy() {},
      onHidden: function onHidden() {},
      onHide: function onHide() {},
      onMount: function onMount() {},
      onShow: function onShow() {},
      onShown: function onShown() {},
      onTrigger: function onTrigger() {},
      onUntrigger: function onUntrigger() {},
      placement: 'top',
      plugins: [],
      popperOptions: {},
      role: 'tooltip',
      showOnCreate: false,
      theme: '',
      touch: true,
      trigger: 'mouseenter focus',
      triggerTarget: null,
      updateDuration: 0,
      zIndex: 9999
    }, pluginProps);
    var defaultKeys = Object.keys(defaultProps);
    /**
     * If the setProps() method encounters one of these, the popperInstance must be
     * recreated
     */

    var POPPER_INSTANCE_DEPENDENCIES = ['arrow', 'boundary', 'distance', 'flip', 'flipBehavior', 'flipOnUpdate', 'offset', 'placement', 'popperOptions'];
    /**
     * Mutates the defaultProps object by setting the props specified
     */

    var setDefaultProps = function setDefaultProps(partialProps) {
      {
        validateProps(partialProps, []);
      }

      var keys = Object.keys(partialProps);
      keys.forEach(function (key) {
        defaultProps[key] = partialProps[key];
      });
    };
    /**
     * Returns an extended props object including plugin props
     */

    function getExtendedPassedProps(passedProps) {
      var plugins = passedProps.plugins || [];
      var pluginProps = plugins.reduce(function (acc, plugin) {
        var name = plugin.name,
            defaultValue = plugin.defaultValue;

        if (name) {
          acc[name] = passedProps[name] !== undefined ? passedProps[name] : defaultValue;
        }

        return acc;
      }, {});
      return _extends$2({}, passedProps, {}, pluginProps);
    }
    /**
     * Returns an object of optional props from data-tippy-* attributes
     */

    function getDataAttributeProps(reference, plugins) {
      var propKeys = plugins ? Object.keys(getExtendedPassedProps(_extends$2({}, defaultProps, {
        plugins: plugins
      }))) : defaultKeys;
      var props = propKeys.reduce(function (acc, key) {
        var valueAsString = (reference.getAttribute("data-tippy-" + key) || '').trim();

        if (!valueAsString) {
          return acc;
        }

        if (key === 'content') {
          acc[key] = valueAsString;
        } else {
          try {
            acc[key] = JSON.parse(valueAsString);
          } catch (e) {
            acc[key] = valueAsString;
          }
        }

        return acc;
      }, {});
      return props;
    }
    /**
     * Evaluates the props object by merging data attributes and disabling
     * conflicting props where necessary
     */

    function evaluateProps(reference, props) {
      var out = _extends$2({}, props, {
        content: invokeWithArgsOrReturn(props.content, [reference])
      }, props.ignoreAttributes ? {} : getDataAttributeProps(reference, props.plugins));

      if (out.interactive) {
        out.aria = null;
      }

      return out;
    }
    /**
     * Validates props with the valid `defaultProps` object
     */

    function validateProps(partialProps, plugins) {
      if (partialProps === void 0) {
        partialProps = {};
      }

      if (plugins === void 0) {
        plugins = [];
      }

      var keys = Object.keys(partialProps);
      keys.forEach(function (prop) {
        var value = partialProps[prop];
        var didSpecifyPlacementInPopperOptions = prop === 'popperOptions' && value !== null && typeof value === 'object' && hasOwnProperty(value, 'placement');
        var nonPluginProps = removeProperties(defaultProps, ['animateFill', 'followCursor', 'inlinePositioning', 'sticky']); // These props have custom warnings

        var customWarningProps = ['a11y', 'arrowType', 'showOnInit', 'size', 'target', 'touchHold'];
        var didPassUnknownProp = !hasOwnProperty(nonPluginProps, prop) && !includes$1(customWarningProps, prop); // Check if the prop exists in `plugins`

        if (didPassUnknownProp) {
          didPassUnknownProp = plugins.filter(function (plugin) {
            return plugin.name === prop;
          }).length === 0;
        }

        warnWhen(prop === 'target', ['The `target` prop was removed in v5 and replaced with the delegate() addon', 'in order to conserve bundle size.', 'See: https://atomiks.github.io/tippyjs/addons/#event-delegation'].join(' '));
        warnWhen(prop === 'a11y', ['The `a11y` prop was removed in v5. Make sure the element you are giving a', 'tippy to is natively focusable, such as <button> or <input>, not <div>', 'or <span>.'].join(' '));
        warnWhen(prop === 'showOnInit', 'The `showOnInit` prop was renamed to `showOnCreate` in v5.');
        warnWhen(prop === 'arrowType', ['The `arrowType` prop was removed in v5 in favor of overloading the `arrow`', 'prop.', '\n\n', '"round" string was replaced with importing the string from the package.', '\n\n', "* import {roundArrow} from 'tippy.js'; (ESM version)\n", '* const {roundArrow} = tippy; (IIFE CDN version)', '\n\n', 'Before: {arrow: true, arrowType: "round"}\n', 'After: {arrow: roundArrow}`'].join(' '));
        warnWhen(prop === 'touchHold', ['The `touchHold` prop was removed in v5 in favor of overloading the `touch`', 'prop.', '\n\n', 'Before: {touchHold: true}\n', 'After: {touch: "hold"}'].join(' '));
        warnWhen(prop === 'size', ['The `size` prop was removed in v5. Instead, use a theme that specifies', 'CSS padding and font-size properties.'].join(' '));
        warnWhen(prop === 'theme' && value === 'google', 'The included theme "google" was renamed to "material" in v5.');
        warnWhen(didSpecifyPlacementInPopperOptions, ['Specifying placement in `popperOptions` is not supported. Use the base-level', '`placement` prop instead.', '\n\n', 'Before: {popperOptions: {placement: "bottom"}}\n', 'After: {placement: "bottom"}'].join(' '));
        warnWhen(didPassUnknownProp, ["`" + prop + "`", "is not a valid prop. You may have spelled it incorrectly, or if it's a", 'plugin, forgot to pass it in an array as props.plugins.', '\n\n', 'In v5, the following props were turned into plugins:', '\n\n', '* animateFill\n', '* followCursor\n', '* sticky', '\n\n', 'All props: https://atomiks.github.io/tippyjs/all-props/\n', 'Plugins: https://atomiks.github.io/tippyjs/plugins/'].join(' '));
      });
    }

    var PASSIVE = {
      passive: true
    };
    var IOS_CLASS = "tippy-iOS";
    var POPPER_CLASS = "tippy-popper";
    var TOOLTIP_CLASS = "tippy-tooltip";
    var CONTENT_CLASS = "tippy-content";
    var ARROW_CLASS = "tippy-arrow";
    var SVG_ARROW_CLASS = "tippy-svg-arrow";
    var POPPER_SELECTOR = "." + POPPER_CLASS;
    var TOOLTIP_SELECTOR = "." + TOOLTIP_CLASS;
    var CONTENT_SELECTOR = "." + CONTENT_CLASS;
    var ARROW_SELECTOR = "." + ARROW_CLASS;
    var SVG_ARROW_SELECTOR = "." + SVG_ARROW_CLASS;

    var currentInput = {
      isTouch: false
    };
    var lastMouseMoveTime = 0;
    /**
     * When a `touchstart` event is fired, it's assumed the user is using touch
     * input. We'll bind a `mousemove` event listener to listen for mouse input in
     * the future. This way, the `isTouch` property is fully dynamic and will handle
     * hybrid devices that use a mix of touch + mouse input.
     */

    function onDocumentTouchStart() {
      if (currentInput.isTouch) {
        return;
      }

      currentInput.isTouch = true;

      if (window.performance) {
        document.addEventListener('mousemove', onDocumentMouseMove);
      }
    }
    /**
     * When two `mousemove` event are fired consecutively within 20ms, it's assumed
     * the user is using mouse input again. `mousemove` can fire on touch devices as
     * well, but very rarely that quickly.
     */

    function onDocumentMouseMove() {
      var now = performance.now();

      if (now - lastMouseMoveTime < 20) {
        currentInput.isTouch = false;
        document.removeEventListener('mousemove', onDocumentMouseMove);
      }

      lastMouseMoveTime = now;
    }
    /**
     * When an element is in focus and has a tippy, leaving the tab/window and
     * returning causes it to show again. For mouse users this is unexpected, but
     * for keyboard use it makes sense.
     * TODO: find a better technique to solve this problem
     */

    function onWindowBlur() {
      var activeElement = document.activeElement;

      if (isReferenceElement(activeElement)) {
        var instance = activeElement._tippy;

        if (activeElement.blur && !instance.state.isVisible) {
          activeElement.blur();
        }
      }
    }
    /**
     * Adds the needed global event listeners
     */

    function bindGlobalEventListeners() {
      document.addEventListener('touchstart', onDocumentTouchStart, _extends$2({}, PASSIVE, {
        capture: true
      }));
      window.addEventListener('blur', onWindowBlur);
    }

    var isBrowser$1 = typeof window !== 'undefined' && typeof document !== 'undefined';
    var ua = isBrowser$1 ? navigator.userAgent : '';
    var isIE$1 = /MSIE |Trident\//.test(ua);
    var isIOS = isBrowser$1 && /iPhone|iPad|iPod/.test(navigator.platform);
    function updateIOSClass(isAdd) {
      var shouldAdd = isAdd && isIOS && currentInput.isTouch;
      document.body.classList[shouldAdd ? 'add' : 'remove'](IOS_CLASS);
    }

    /**
     * Returns the popper's placement, ignoring shifting (top-start, etc)
     */

    function getBasePlacement(placement) {
      return placement.split('-')[0];
    }
    /**
     * Adds `data-inertia` attribute
     */

    function addInertia(tooltip) {
      tooltip.setAttribute('data-inertia', '');
    }
    /**
     * Removes `data-inertia` attribute
     */

    function removeInertia(tooltip) {
      tooltip.removeAttribute('data-inertia');
    }
    /**
     * Adds interactive-related attributes
     */

    function addInteractive(tooltip) {
      tooltip.setAttribute('data-interactive', '');
    }
    /**
     * Removes interactive-related attributes
     */

    function removeInteractive(tooltip) {
      tooltip.removeAttribute('data-interactive');
    }
    /**
     * Sets the content of a tooltip
     */

    function setContent(contentEl, props) {
      if (isElement(props.content)) {
        setInnerHTML(contentEl, '');
        contentEl.appendChild(props.content);
      } else if (typeof props.content !== 'function') {
        var key = props.allowHTML ? 'innerHTML' : 'textContent';
        contentEl[key] = props.content;
      }
    }
    /**
     * Returns the child elements of a popper element
     */

    function getChildren(popper) {
      return {
        tooltip: popper.querySelector(TOOLTIP_SELECTOR),
        content: popper.querySelector(CONTENT_SELECTOR),
        arrow: popper.querySelector(ARROW_SELECTOR) || popper.querySelector(SVG_ARROW_SELECTOR)
      };
    }
    /**
     * Creates an arrow element and returns it
     */

    function createArrowElement(arrow) {
      var arrowElement = div();

      if (arrow === true) {
        arrowElement.className = ARROW_CLASS;
      } else {
        arrowElement.className = SVG_ARROW_CLASS;

        if (isElement(arrow)) {
          arrowElement.appendChild(arrow);
        } else {
          setInnerHTML(arrowElement, arrow);
        }
      }

      return arrowElement;
    }
    /**
     * Constructs the popper element and returns it
     */

    function createPopperElement(id, props) {
      var popper = div();
      popper.className = POPPER_CLASS;
      popper.style.position = 'absolute';
      popper.style.top = '0';
      popper.style.left = '0';
      var tooltip = div();
      tooltip.className = TOOLTIP_CLASS;
      tooltip.id = "tippy-" + id;
      tooltip.setAttribute('data-state', 'hidden');
      tooltip.setAttribute('tabindex', '-1');
      updateTheme(tooltip, 'add', props.theme);
      var content = div();
      content.className = CONTENT_CLASS;
      content.setAttribute('data-state', 'hidden');

      if (props.interactive) {
        addInteractive(tooltip);
      }

      if (props.arrow) {
        tooltip.setAttribute('data-arrow', '');
        tooltip.appendChild(createArrowElement(props.arrow));
      }

      if (props.inertia) {
        addInertia(tooltip);
      }

      setContent(content, props);
      tooltip.appendChild(content);
      popper.appendChild(tooltip);
      updatePopperElement(popper, props, props);
      return popper;
    }
    /**
     * Updates the popper element based on the new props
     */

    function updatePopperElement(popper, prevProps, nextProps) {
      var _getChildren = getChildren(popper),
          tooltip = _getChildren.tooltip,
          content = _getChildren.content,
          arrow = _getChildren.arrow;

      popper.style.zIndex = '' + nextProps.zIndex;
      tooltip.setAttribute('data-animation', nextProps.animation);
      tooltip.style.maxWidth = appendPxIfNumber(nextProps.maxWidth);

      if (nextProps.role) {
        tooltip.setAttribute('role', nextProps.role);
      } else {
        tooltip.removeAttribute('role');
      }

      if (prevProps.content !== nextProps.content) {
        setContent(content, nextProps);
      } // arrow


      if (!prevProps.arrow && nextProps.arrow) {
        // false to true
        tooltip.appendChild(createArrowElement(nextProps.arrow));
        tooltip.setAttribute('data-arrow', '');
      } else if (prevProps.arrow && !nextProps.arrow) {
        // true to false
        tooltip.removeChild(arrow);
        tooltip.removeAttribute('data-arrow');
      } else if (prevProps.arrow !== nextProps.arrow) {
        // true to 'round' or vice-versa
        tooltip.removeChild(arrow);
        tooltip.appendChild(createArrowElement(nextProps.arrow));
      } // interactive


      if (!prevProps.interactive && nextProps.interactive) {
        addInteractive(tooltip);
      } else if (prevProps.interactive && !nextProps.interactive) {
        removeInteractive(tooltip);
      } // inertia


      if (!prevProps.inertia && nextProps.inertia) {
        addInertia(tooltip);
      } else if (prevProps.inertia && !nextProps.inertia) {
        removeInertia(tooltip);
      } // theme


      if (prevProps.theme !== nextProps.theme) {
        updateTheme(tooltip, 'remove', prevProps.theme);
        updateTheme(tooltip, 'add', nextProps.theme);
      }
    }
    /**
     * Add/remove transitionend listener from tooltip
     */

    function updateTransitionEndListener(tooltip, action, listener) {
      ['transitionend', 'webkitTransitionEnd'].forEach(function (event) {
        tooltip[action + 'EventListener'](event, listener);
      });
    }
    /**
     * Adds/removes theme from tooltip's classList
     */

    function updateTheme(tooltip, action, theme) {
      splitBySpaces(theme).forEach(function (name) {
        tooltip.classList[action](name + "-theme");
      });
    }
    /**
     * Determines if the mouse cursor is outside of the popper's interactive border
     * region
     */

    function isCursorOutsideInteractiveBorder(popperTreeData, event) {
      var clientX = event.clientX,
          clientY = event.clientY;
      return popperTreeData.every(function (_ref) {
        var popperRect = _ref.popperRect,
            tooltipRect = _ref.tooltipRect,
            interactiveBorder = _ref.interactiveBorder;
        // Get min/max bounds of both the popper and tooltip rects due to
        // `distance` offset
        var mergedRect = {
          top: Math.min(popperRect.top, tooltipRect.top),
          right: Math.max(popperRect.right, tooltipRect.right),
          bottom: Math.max(popperRect.bottom, tooltipRect.bottom),
          left: Math.min(popperRect.left, tooltipRect.left)
        };
        var exceedsTop = mergedRect.top - clientY > interactiveBorder;
        var exceedsBottom = clientY - mergedRect.bottom > interactiveBorder;
        var exceedsLeft = mergedRect.left - clientX > interactiveBorder;
        var exceedsRight = clientX - mergedRect.right > interactiveBorder;
        return exceedsTop || exceedsBottom || exceedsLeft || exceedsRight;
      });
    }

    var idCounter = 1;
    var mouseMoveListeners = [];
    /**
     * Used by `hideAll()`
     */

    var mountedInstances = [];
    /**
     * Creates and returns a Tippy object. We're using a closure pattern instead of
     * a class so that the exposed object API is clean without private members
     * prefixed with `_`.
     */

    function createTippy(reference, passedProps) {
      var props = evaluateProps(reference, _extends$2({}, defaultProps, {}, getExtendedPassedProps(passedProps))); // If the reference shouldn't have multiple tippys, return null early

      if (!props.multiple && reference._tippy) {
        return null;
      }
      /* ======================= 🔒 Private members 🔒 ======================= */


      var showTimeout;
      var hideTimeout;
      var scheduleHideAnimationFrame;
      var isBeingDestroyed = false;
      var isVisibleFromClick = false;
      var didHideDueToDocumentMouseDown = false;
      var popperUpdates = 0;
      var lastTriggerEvent;
      var currentMountCallback;
      var currentTransitionEndListener;
      var listeners = [];
      var debouncedOnMouseMove = debounce$1(onMouseMove, props.interactiveDebounce);
      var currentTarget; // Support iframe contexts
      // Static check that assumes any of the `triggerTarget` or `reference`
      // nodes will never change documents, even when they are updated

      var doc = getOwnerDocument(props.triggerTarget || reference);
      /* ======================= 🔑 Public members 🔑 ======================= */

      var id = idCounter++;
      var popper = createPopperElement(id, props);
      var popperChildren = getChildren(popper);
      var popperInstance = null;
      var plugins = unique(props.plugins); // These two elements are static

      var tooltip = popperChildren.tooltip,
          content = popperChildren.content;
      var transitionableElements = [tooltip, content];
      var state = {
        // The current real placement (`data-placement` attribute)
        currentPlacement: null,
        // Is the instance currently enabled?
        isEnabled: true,
        // Is the tippy currently showing and not transitioning out?
        isVisible: false,
        // Has the instance been destroyed?
        isDestroyed: false,
        // Is the tippy currently mounted to the DOM?
        isMounted: false,
        // Has the tippy finished transitioning in?
        isShown: false
      };
      var instance = {
        // properties
        id: id,
        reference: reference,
        popper: popper,
        popperChildren: popperChildren,
        popperInstance: popperInstance,
        props: props,
        state: state,
        plugins: plugins,
        // methods
        clearDelayTimeouts: clearDelayTimeouts,
        setProps: setProps,
        setContent: setContent,
        show: show,
        hide: hide,
        enable: enable,
        disable: disable,
        destroy: destroy
      };
      /* ==================== Initial instance mutations =================== */

      reference._tippy = instance;
      popper._tippy = instance;
      var pluginsHooks = plugins.map(function (plugin) {
        return plugin.fn(instance);
      });
      var hadAriaExpandedAttributeOnCreate = reference.hasAttribute('aria-expanded');
      addListenersToTriggerTarget();
      handleAriaExpandedAttribute();

      if (!props.lazy) {
        createPopperInstance();
      }

      invokeHook('onCreate', [instance]);

      if (props.showOnCreate) {
        scheduleShow();
      } // Prevent a tippy with a delay from hiding if the cursor left then returned
      // before it started hiding


      popper.addEventListener('mouseenter', function () {
        if (instance.props.interactive && instance.state.isVisible) {
          instance.clearDelayTimeouts();
        }
      });
      popper.addEventListener('mouseleave', function (event) {
        if (instance.props.interactive && includes$1(instance.props.trigger, 'mouseenter')) {
          debouncedOnMouseMove(event);
          doc.addEventListener('mousemove', debouncedOnMouseMove);
        }
      });
      return instance;
      /* ======================= 🔒 Private methods 🔒 ======================= */

      function getNormalizedTouchSettings() {
        var touch = instance.props.touch;
        return Array.isArray(touch) ? touch : [touch, 0];
      }

      function getIsCustomTouchBehavior() {
        return getNormalizedTouchSettings()[0] === 'hold';
      }

      function getCurrentTarget() {
        return currentTarget || reference;
      }

      function getDelay(isShow) {
        // For touch or keyboard input, force `0` delay for UX reasons
        // Also if the instance is mounted but not visible (transitioning out),
        // ignore delay
        if (instance.state.isMounted && !instance.state.isVisible || currentInput.isTouch || lastTriggerEvent && lastTriggerEvent.type === 'focus') {
          return 0;
        }

        return getValueAtIndexOrReturn(instance.props.delay, isShow ? 0 : 1, defaultProps.delay);
      }

      function invokeHook(hook, args, shouldInvokePropsHook) {
        if (shouldInvokePropsHook === void 0) {
          shouldInvokePropsHook = true;
        }

        pluginsHooks.forEach(function (pluginHooks) {
          if (hasOwnProperty(pluginHooks, hook)) {
            // @ts-ignore
            pluginHooks[hook].apply(pluginHooks, args);
          }
        });

        if (shouldInvokePropsHook) {
          var _instance$props;

          // @ts-ignore
          (_instance$props = instance.props)[hook].apply(_instance$props, args);
        }
      }

      function handleAriaDescribedByAttribute() {
        var aria = instance.props.aria;

        if (!aria) {
          return;
        }

        var attr = "aria-" + aria;
        var id = tooltip.id;
        var nodes = normalizeToArray(instance.props.triggerTarget || reference);
        nodes.forEach(function (node) {
          var currentValue = node.getAttribute(attr);

          if (instance.state.isVisible) {
            node.setAttribute(attr, currentValue ? currentValue + " " + id : id);
          } else {
            var nextValue = currentValue && currentValue.replace(id, '').trim();

            if (nextValue) {
              node.setAttribute(attr, nextValue);
            } else {
              node.removeAttribute(attr);
            }
          }
        });
      }

      function handleAriaExpandedAttribute() {
        // If the user has specified `aria-expanded` on their reference when the
        // instance was created, we have to assume they're controlling it externally
        // themselves
        if (hadAriaExpandedAttributeOnCreate) {
          return;
        }

        var nodes = normalizeToArray(instance.props.triggerTarget || reference);
        nodes.forEach(function (node) {
          if (instance.props.interactive) {
            node.setAttribute('aria-expanded', instance.state.isVisible && node === getCurrentTarget() ? 'true' : 'false');
          } else {
            node.removeAttribute('aria-expanded');
          }
        });
      }

      function cleanupInteractiveMouseListeners() {
        doc.body.removeEventListener('mouseleave', scheduleHide);
        doc.removeEventListener('mousemove', debouncedOnMouseMove);
        mouseMoveListeners = mouseMoveListeners.filter(function (listener) {
          return listener !== debouncedOnMouseMove;
        });
      }

      function onDocumentMouseDown(event) {
        // Clicked on interactive popper
        if (instance.props.interactive && popper.contains(event.target)) {
          return;
        } // Clicked on the event listeners target


        if (getCurrentTarget().contains(event.target)) {
          if (currentInput.isTouch) {
            return;
          }

          if (instance.state.isVisible && includes$1(instance.props.trigger, 'click')) {
            return;
          }
        }

        if (instance.props.hideOnClick === true) {
          isVisibleFromClick = false;
          instance.clearDelayTimeouts();
          instance.hide(); // `mousedown` event is fired right before `focus` if pressing the
          // currentTarget. This lets a tippy with `focus` trigger know that it
          // should not show

          didHideDueToDocumentMouseDown = true;
          setTimeout(function () {
            didHideDueToDocumentMouseDown = false;
          }); // The listener gets added in `scheduleShow()`, but this may be hiding it
          // before it shows, and hide()'s early bail-out behavior can prevent it
          // from being cleaned up

          if (!instance.state.isMounted) {
            removeDocumentMouseDownListener();
          }
        }
      }

      function addDocumentMouseDownListener() {
        doc.addEventListener('mousedown', onDocumentMouseDown, true);
      }

      function removeDocumentMouseDownListener() {
        doc.removeEventListener('mousedown', onDocumentMouseDown, true);
      }

      function onTransitionedOut(duration, callback) {
        onTransitionEnd(duration, function () {
          if (!instance.state.isVisible && popper.parentNode && popper.parentNode.contains(popper)) {
            callback();
          }
        });
      }

      function onTransitionedIn(duration, callback) {
        onTransitionEnd(duration, callback);
      }

      function onTransitionEnd(duration, callback) {
        function listener(event) {
          if (event.target === tooltip) {
            updateTransitionEndListener(tooltip, 'remove', listener);
            callback();
          }
        } // Make callback synchronous if duration is 0
        // `transitionend` won't fire otherwise


        if (duration === 0) {
          return callback();
        }

        updateTransitionEndListener(tooltip, 'remove', currentTransitionEndListener);
        updateTransitionEndListener(tooltip, 'add', listener);
        currentTransitionEndListener = listener;
      }

      function on(eventType, handler, options) {
        if (options === void 0) {
          options = false;
        }

        var nodes = normalizeToArray(instance.props.triggerTarget || reference);
        nodes.forEach(function (node) {
          node.addEventListener(eventType, handler, options);
          listeners.push({
            node: node,
            eventType: eventType,
            handler: handler,
            options: options
          });
        });
      }

      function addListenersToTriggerTarget() {
        if (getIsCustomTouchBehavior()) {
          on('touchstart', onTrigger, PASSIVE);
          on('touchend', onMouseLeave, PASSIVE);
        }

        splitBySpaces(instance.props.trigger).forEach(function (eventType) {
          if (eventType === 'manual') {
            return;
          }

          on(eventType, onTrigger);

          switch (eventType) {
            case 'mouseenter':
              on('mouseleave', onMouseLeave);
              break;

            case 'focus':
              on(isIE$1 ? 'focusout' : 'blur', onBlurOrFocusOut);
              break;

            case 'focusin':
              on('focusout', onBlurOrFocusOut);
              break;
          }
        });
      }

      function removeListenersFromTriggerTarget() {
        listeners.forEach(function (_ref) {
          var node = _ref.node,
              eventType = _ref.eventType,
              handler = _ref.handler,
              options = _ref.options;
          node.removeEventListener(eventType, handler, options);
        });
        listeners = [];
      }

      function onTrigger(event) {
        var shouldScheduleClickHide = false;

        if (!instance.state.isEnabled || isEventListenerStopped(event) || didHideDueToDocumentMouseDown) {
          return;
        }

        lastTriggerEvent = event;
        currentTarget = event.currentTarget;
        handleAriaExpandedAttribute();

        if (!instance.state.isVisible && isMouseEvent(event)) {
          // If scrolling, `mouseenter` events can be fired if the cursor lands
          // over a new target, but `mousemove` events don't get fired. This
          // causes interactive tooltips to get stuck open until the cursor is
          // moved
          mouseMoveListeners.forEach(function (listener) {
            return listener(event);
          });
        } // Toggle show/hide when clicking click-triggered tooltips


        if (event.type === 'click' && (!includes$1(instance.props.trigger, 'mouseenter') || isVisibleFromClick) && instance.props.hideOnClick !== false && instance.state.isVisible) {
          shouldScheduleClickHide = true;
        } else {
          var _getNormalizedTouchSe = getNormalizedTouchSettings(),
              value = _getNormalizedTouchSe[0],
              duration = _getNormalizedTouchSe[1];

          if (currentInput.isTouch && value === 'hold' && duration) {
            // We can hijack the show timeout here, it will be cleared by
            // `scheduleHide()` when necessary
            showTimeout = setTimeout(function () {
              scheduleShow(event);
            }, duration);
          } else {
            scheduleShow(event);
          }
        }

        if (event.type === 'click') {
          isVisibleFromClick = !shouldScheduleClickHide;
        }

        if (shouldScheduleClickHide) {
          scheduleHide(event);
        }
      }

      function onMouseMove(event) {
        var isCursorOverReferenceOrPopper = closestCallback(event.target, function (el) {
          return el === reference || el === popper;
        });

        if (event.type === 'mousemove' && isCursorOverReferenceOrPopper) {
          return;
        }

        var popperTreeData = arrayFrom(popper.querySelectorAll(POPPER_SELECTOR)).concat(popper).map(function (popper) {
          var instance = popper._tippy;
          var tooltip = instance.popperChildren.tooltip;
          var interactiveBorder = instance.props.interactiveBorder;
          return {
            popperRect: popper.getBoundingClientRect(),
            tooltipRect: tooltip.getBoundingClientRect(),
            interactiveBorder: interactiveBorder
          };
        });

        if (isCursorOutsideInteractiveBorder(popperTreeData, event)) {
          cleanupInteractiveMouseListeners();
          scheduleHide(event);
        }
      }

      function onMouseLeave(event) {
        if (isEventListenerStopped(event)) {
          return;
        }

        if (includes$1(instance.props.trigger, 'click') && isVisibleFromClick) {
          return;
        }

        if (instance.props.interactive) {
          doc.body.addEventListener('mouseleave', scheduleHide);
          doc.addEventListener('mousemove', debouncedOnMouseMove);
          pushIfUnique(mouseMoveListeners, debouncedOnMouseMove);
          debouncedOnMouseMove(event);
          return;
        }

        scheduleHide(event);
      }

      function onBlurOrFocusOut(event) {
        if (!includes$1(instance.props.trigger, 'focusin') && event.target !== getCurrentTarget()) {
          return;
        } // If focus was moved to within the popper


        if (instance.props.interactive && event.relatedTarget && popper.contains(event.relatedTarget)) {
          return;
        }

        scheduleHide(event);
      }

      function isEventListenerStopped(event) {
        var supportsTouch = 'ontouchstart' in window;
        var isTouchEvent = includes$1(event.type, 'touch');
        var isCustomTouch = getIsCustomTouchBehavior();
        return supportsTouch && currentInput.isTouch && isCustomTouch && !isTouchEvent || currentInput.isTouch && !isCustomTouch && isTouchEvent;
      }

      function createPopperInstance() {
        var popperOptions = instance.props.popperOptions;
        var arrow = instance.popperChildren.arrow;
        var flipModifier = getModifier(popperOptions, 'flip');
        var preventOverflowModifier = getModifier(popperOptions, 'preventOverflow');
        var distancePx;

        function applyMutations(data) {
          var prevPlacement = instance.state.currentPlacement;
          instance.state.currentPlacement = data.placement;

          if (instance.props.flip && !instance.props.flipOnUpdate) {
            if (data.flipped) {
              instance.popperInstance.options.placement = data.placement;
            }

            setModifierValue(instance.popperInstance.modifiers, 'flip', 'enabled', false);
          }

          tooltip.setAttribute('data-placement', data.placement);

          if (data.attributes['x-out-of-boundaries'] !== false) {
            tooltip.setAttribute('data-out-of-boundaries', '');
          } else {
            tooltip.removeAttribute('data-out-of-boundaries');
          }

          var basePlacement = getBasePlacement(data.placement);
          var isVerticalPlacement = includes$1(['top', 'bottom'], basePlacement);
          var isSecondaryPlacement = includes$1(['bottom', 'right'], basePlacement); // Apply `distance` prop

          tooltip.style.top = '0';
          tooltip.style.left = '0';
          tooltip.style[isVerticalPlacement ? 'top' : 'left'] = (isSecondaryPlacement ? 1 : -1) * distancePx + 'px'; // Careful not to cause an infinite loop here
          // Fixes https://github.com/FezVrasta/popper.js/issues/784

          if (prevPlacement && prevPlacement !== data.placement) {
            instance.popperInstance.update();
          }
        }

        var config = _extends$2({
          eventsEnabled: false,
          placement: instance.props.placement
        }, popperOptions, {
          modifiers: _extends$2({}, popperOptions && popperOptions.modifiers, {
            // We can't use `padding` on the popper el because of these bugs when
            // flipping from a vertical to horizontal placement or vice-versa,
            // there is severe flickering.
            // https://github.com/FezVrasta/popper.js/issues/720
            // This workaround increases bundle size by 250B minzip unfortunately,
            // due to need to custom compute the distance (since Popper rect does
            // not get affected by the inner tooltip's distance offset)
            tippyDistance: {
              enabled: true,
              order: 0,
              fn: function fn(data) {
                // `html` fontSize may change while `popperInstance` is alive
                // e.g. on resize in media queries
                distancePx = getUnitsInPx(doc, instance.props.distance);
                var basePlacement = getBasePlacement(data.placement);
                var computedPreventOverflowPadding = getComputedPadding(basePlacement, preventOverflowModifier && preventOverflowModifier.padding, distancePx);
                var computedFlipPadding = getComputedPadding(basePlacement, flipModifier && flipModifier.padding, distancePx);
                var instanceModifiers = instance.popperInstance.modifiers;
                setModifierValue(instanceModifiers, 'preventOverflow', 'padding', computedPreventOverflowPadding);
                setModifierValue(instanceModifiers, 'flip', 'padding', computedFlipPadding);
                return data;
              }
            },
            preventOverflow: _extends$2({
              boundariesElement: instance.props.boundary
            }, preventOverflowModifier),
            flip: _extends$2({
              enabled: instance.props.flip,
              behavior: instance.props.flipBehavior
            }, flipModifier),
            arrow: _extends$2({
              element: arrow,
              enabled: !!arrow
            }, getModifier(popperOptions, 'arrow')),
            offset: _extends$2({
              offset: instance.props.offset
            }, getModifier(popperOptions, 'offset'))
          }),
          onCreate: function onCreate(data) {
            applyMutations(data);
            preserveInvocation(popperOptions && popperOptions.onCreate, config.onCreate, [data]);
            runMountCallback();
          },
          onUpdate: function onUpdate(data) {
            applyMutations(data);
            preserveInvocation(popperOptions && popperOptions.onUpdate, config.onUpdate, [data]);
            runMountCallback();
          }
        });

        instance.popperInstance = new Popper(reference, popper, config);
      }

      function runMountCallback() {
        // Only invoke currentMountCallback after 2 updates
        // This fixes some bugs in Popper.js (TODO: aim for only 1 update)
        if (popperUpdates === 0) {
          popperUpdates++; // 1

          instance.popperInstance.update();
        } else if (currentMountCallback && popperUpdates === 1) {
          popperUpdates++; // 2

          reflow(popper);
          currentMountCallback();
        }
      }

      function mount() {
        // The mounting callback (`currentMountCallback`) is only run due to a
        // popperInstance update/create
        popperUpdates = 0;
        var appendTo = instance.props.appendTo;
        var parentNode; // By default, we'll append the popper to the triggerTargets's parentNode so
        // it's directly after the reference element so the elements inside the
        // tippy can be tabbed to
        // If there are clipping issues, the user can specify a different appendTo
        // and ensure focus management is handled correctly manually

        var node = getCurrentTarget();

        if (instance.props.interactive && appendTo === defaultProps.appendTo || appendTo === 'parent') {
          parentNode = node.parentNode;
        } else {
          parentNode = invokeWithArgsOrReturn(appendTo, [node]);
        } // The popper element needs to exist on the DOM before its position can be
        // updated as Popper.js needs to read its dimensions


        if (!parentNode.contains(popper)) {
          parentNode.appendChild(popper);
        }

        {
          // Accessibility check
          warnWhen(instance.props.interactive && appendTo === defaultProps.appendTo && node.nextElementSibling !== popper, ['Interactive tippy element may not be accessible via keyboard navigation', 'because it is not directly after the reference element in the DOM source', 'order.', '\n\n', 'Using a wrapper <div> or <span> tag around the reference element solves', 'this by creating a new parentNode context.', '\n\n', 'Specifying `appendTo: document.body` silences this warning, but it', 'assumes you are using a focus management solution to handle keyboard', 'navigation.', '\n\n', 'See: https://atomiks.github.io/tippyjs/accessibility/#interactivity'].join(' '));
        }

        setModifierValue(instance.popperInstance.modifiers, 'flip', 'enabled', instance.props.flip);
        instance.popperInstance.enableEventListeners(); // Mounting callback invoked in `onUpdate`

        instance.popperInstance.update();
      }

      function scheduleShow(event) {
        instance.clearDelayTimeouts();

        if (!instance.popperInstance) {
          createPopperInstance();
        }

        if (event) {
          invokeHook('onTrigger', [instance, event]);
        }

        addDocumentMouseDownListener();
        var delay = getDelay(true);

        if (delay) {
          showTimeout = setTimeout(function () {
            instance.show();
          }, delay);
        } else {
          instance.show();
        }
      }

      function scheduleHide(event) {
        instance.clearDelayTimeouts();
        invokeHook('onUntrigger', [instance, event]);

        if (!instance.state.isVisible) {
          removeDocumentMouseDownListener();
          return;
        } // For interactive tippies, scheduleHide is added to a document.body handler
        // from onMouseLeave so must intercept scheduled hides from mousemove/leave
        // events when trigger contains mouseenter and click, and the tip is
        // currently shown as a result of a click.


        if (includes$1(instance.props.trigger, 'mouseenter') && includes$1(instance.props.trigger, 'click') && includes$1(['mouseleave', 'mousemove'], event.type) && isVisibleFromClick) {
          return;
        }

        var delay = getDelay(false);

        if (delay) {
          hideTimeout = setTimeout(function () {
            if (instance.state.isVisible) {
              instance.hide();
            }
          }, delay);
        } else {
          // Fixes a `transitionend` problem when it fires 1 frame too
          // late sometimes, we don't want hide() to be called.
          scheduleHideAnimationFrame = requestAnimationFrame(function () {
            instance.hide();
          });
        }
      }
      /* ======================= 🔑 Public methods 🔑 ======================= */


      function enable() {
        instance.state.isEnabled = true;
      }

      function disable() {
        // Disabling the instance should also hide it
        // https://github.com/atomiks/tippy.js-react/issues/106
        instance.hide();
        instance.state.isEnabled = false;
      }

      function clearDelayTimeouts() {
        clearTimeout(showTimeout);
        clearTimeout(hideTimeout);
        cancelAnimationFrame(scheduleHideAnimationFrame);
      }

      function setProps(partialProps) {
        {
          warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('setProps'));
        }

        if (instance.state.isDestroyed) {
          return;
        }

        {
          validateProps(partialProps, plugins);
          warnWhen(partialProps.plugins ? partialProps.plugins.length !== plugins.length || plugins.some(function (p, i) {
            if (partialProps.plugins && partialProps.plugins[i]) {
              return p !== partialProps.plugins[i];
            } else {
              return true;
            }
          }) : false, "Cannot update plugins");
        }

        invokeHook('onBeforeUpdate', [instance, partialProps]);
        removeListenersFromTriggerTarget();
        var prevProps = instance.props;
        var nextProps = evaluateProps(reference, _extends$2({}, instance.props, {}, partialProps, {
          ignoreAttributes: true
        }));
        nextProps.ignoreAttributes = useIfDefined(partialProps.ignoreAttributes, prevProps.ignoreAttributes);
        instance.props = nextProps;
        addListenersToTriggerTarget();

        if (prevProps.interactiveDebounce !== nextProps.interactiveDebounce) {
          cleanupInteractiveMouseListeners();
          debouncedOnMouseMove = debounce$1(onMouseMove, nextProps.interactiveDebounce);
        }

        updatePopperElement(popper, prevProps, nextProps);
        instance.popperChildren = getChildren(popper); // Ensure stale aria-expanded attributes are removed

        if (prevProps.triggerTarget && !nextProps.triggerTarget) {
          normalizeToArray(prevProps.triggerTarget).forEach(function (node) {
            node.removeAttribute('aria-expanded');
          });
        } else if (nextProps.triggerTarget) {
          reference.removeAttribute('aria-expanded');
        }

        handleAriaExpandedAttribute();

        if (instance.popperInstance) {
          if (POPPER_INSTANCE_DEPENDENCIES.some(function (prop) {
            return hasOwnProperty(partialProps, prop) && partialProps[prop] !== prevProps[prop];
          })) {
            var currentReference = instance.popperInstance.reference;
            instance.popperInstance.destroy();
            createPopperInstance();
            instance.popperInstance.reference = currentReference;

            if (instance.state.isVisible) {
              instance.popperInstance.enableEventListeners();
            }
          } else {
            instance.popperInstance.update();
          }
        }

        invokeHook('onAfterUpdate', [instance, partialProps]);
      }

      function setContent(content) {
        instance.setProps({
          content: content
        });
      }

      function show(duration) {
        if (duration === void 0) {
          duration = getValueAtIndexOrReturn(instance.props.duration, 0, defaultProps.duration);
        }

        {
          warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('show'));
        } // Early bail-out


        var isAlreadyVisible = instance.state.isVisible;
        var isDestroyed = instance.state.isDestroyed;
        var isDisabled = !instance.state.isEnabled;
        var isTouchAndTouchDisabled = currentInput.isTouch && !instance.props.touch;

        if (isAlreadyVisible || isDestroyed || isDisabled || isTouchAndTouchDisabled) {
          return;
        } // Normalize `disabled` behavior across browsers.
        // Firefox allows events on disabled elements, but Chrome doesn't.
        // Using a wrapper element (i.e. <span>) is recommended.


        if (getCurrentTarget().hasAttribute('disabled')) {
          return;
        }

        if (!instance.popperInstance) {
          createPopperInstance();
        }

        invokeHook('onShow', [instance], false);

        if (instance.props.onShow(instance) === false) {
          return;
        }

        addDocumentMouseDownListener();
        popper.style.visibility = 'visible';
        instance.state.isVisible = true; // Prevent a transition of the popper from its previous position and of the
        // elements at a different placement
        // Check if the tippy was fully unmounted before `show()` was called, to
        // allow for smooth transition for `createSingleton()`

        if (!instance.state.isMounted) {
          setTransitionDuration(transitionableElements.concat(popper), 0);
        }

        currentMountCallback = function currentMountCallback() {
          if (!instance.state.isVisible) {
            return;
          }

          setTransitionDuration([popper], instance.props.updateDuration);
          setTransitionDuration(transitionableElements, duration);
          setVisibilityState(transitionableElements, 'visible');
          handleAriaDescribedByAttribute();
          handleAriaExpandedAttribute();
          pushIfUnique(mountedInstances, instance);
          updateIOSClass(true);
          instance.state.isMounted = true;
          invokeHook('onMount', [instance]);
          onTransitionedIn(duration, function () {
            instance.state.isShown = true;
            invokeHook('onShown', [instance]);
          });
        };

        mount();
      }

      function hide(duration) {
        if (duration === void 0) {
          duration = getValueAtIndexOrReturn(instance.props.duration, 1, defaultProps.duration);
        }

        {
          warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('hide'));
        } // Early bail-out


        var isAlreadyHidden = !instance.state.isVisible && !isBeingDestroyed;
        var isDestroyed = instance.state.isDestroyed;
        var isDisabled = !instance.state.isEnabled && !isBeingDestroyed;

        if (isAlreadyHidden || isDestroyed || isDisabled) {
          return;
        }

        invokeHook('onHide', [instance], false);

        if (instance.props.onHide(instance) === false && !isBeingDestroyed) {
          return;
        }

        removeDocumentMouseDownListener();
        popper.style.visibility = 'hidden';
        instance.state.isVisible = false;
        instance.state.isShown = false;
        setTransitionDuration(transitionableElements, duration);
        setVisibilityState(transitionableElements, 'hidden');
        handleAriaDescribedByAttribute();
        handleAriaExpandedAttribute();
        onTransitionedOut(duration, function () {
          instance.popperInstance.disableEventListeners();
          instance.popperInstance.options.placement = instance.props.placement;
          popper.parentNode.removeChild(popper);
          mountedInstances = mountedInstances.filter(function (i) {
            return i !== instance;
          });

          if (mountedInstances.length === 0) {
            updateIOSClass(false);
          }

          instance.state.isMounted = false;
          invokeHook('onHidden', [instance]);
        });
      }

      function destroy() {
        {
          warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('destroy'));
        }

        if (instance.state.isDestroyed) {
          return;
        }

        isBeingDestroyed = true;
        instance.clearDelayTimeouts();
        instance.hide(0);
        removeListenersFromTriggerTarget();
        delete reference._tippy;

        if (instance.popperInstance) {
          instance.popperInstance.destroy();
        }

        isBeingDestroyed = false;
        instance.state.isDestroyed = true;
        invokeHook('onDestroy', [instance]);
      }
    }

    function tippy(targets, optionalProps,
    /** @deprecated use Props.plugins */
    plugins) {
      if (optionalProps === void 0) {
        optionalProps = {};
      }

      if (plugins === void 0) {
        plugins = [];
      }

      plugins = defaultProps.plugins.concat(optionalProps.plugins || plugins);

      {
        validateTargets(targets);
        validateProps(optionalProps, plugins);
      }

      bindGlobalEventListeners();

      var passedProps = _extends$2({}, optionalProps, {
        plugins: plugins
      });

      var elements = getArrayOfElements(targets);

      {
        var isSingleContentElement = isElement(passedProps.content);
        var isMoreThanOneReferenceElement = elements.length > 1;
        warnWhen(isSingleContentElement && isMoreThanOneReferenceElement, ['tippy() was passed an Element as the `content` prop, but more than one tippy', 'instance was created by this invocation. This means the content element will', 'only be appended to the last tippy instance.', '\n\n', 'Instead, pass the .innerHTML of the element, or use a function that returns a', 'cloned version of the element instead.', '\n\n', '1) content: element.innerHTML\n', '2) content: () => element.cloneNode(true)'].join(' '));
      }

      var instances = elements.reduce(function (acc, reference) {
        var instance = reference && createTippy(reference, passedProps);

        if (instance) {
          acc.push(instance);
        }

        return acc;
      }, []);
      return isElement(targets) ? instances[0] : instances;
    }

    tippy.version = version;
    tippy.defaultProps = defaultProps;
    tippy.setDefaultProps = setDefaultProps;
    tippy.currentInput = currentInput;
    //# sourceMappingURL=tippy.chunk.esm.js.map

    /**!
    * tippy.js v5.2.1
    * (c) 2017-2020 atomiks
    * MIT License
    */

    var followCursor = {
      name: 'followCursor',
      defaultValue: false,
      fn: function fn(instance) {
        var reference = instance.reference,
            popper = instance.popper;
        var originalReference = null; // Support iframe contexts
        // Static check that assumes any of the `triggerTarget` or `reference`
        // nodes will never change documents, even when they are updated

        var doc = getOwnerDocument(instance.props.triggerTarget || reference); // Internal state

        var lastMouseMoveEvent;
        var mouseCoords = null;
        var isInternallySettingControlledProp = false; // These are controlled by this plugin, so we need to store the user's
        // original prop value

        var userProps = instance.props;

        function setUserProps(props) {
          var keys = Object.keys(props);
          keys.forEach(function (prop) {
            userProps[prop] = useIfDefined(props[prop], userProps[prop]);
          });
        }

        function getIsManual() {
          return instance.props.trigger.trim() === 'manual';
        }

        function getIsEnabled() {
          // #597
          var isValidMouseEvent = getIsManual() ? true : // Check if a keyboard "click"
          mouseCoords !== null && !(mouseCoords.clientX === 0 && mouseCoords.clientY === 0);
          return instance.props.followCursor && isValidMouseEvent;
        }

        function getIsInitialBehavior() {
          return currentInput.isTouch || instance.props.followCursor === 'initial' && instance.state.isVisible;
        }

        function resetReference() {
          if (instance.popperInstance && originalReference) {
            instance.popperInstance.reference = originalReference;
          }
        }

        function handlePlacement() {
          // Due to `getVirtualOffsets()`, we need to reverse the placement if it's
          // shifted (start -> end, and vice-versa)
          // Early bail-out
          if (!getIsEnabled() && instance.props.placement === userProps.placement) {
            return;
          }

          var placement = userProps.placement;
          var shift = placement.split('-')[1];
          isInternallySettingControlledProp = true;
          instance.setProps({
            placement: getIsEnabled() && shift ? placement.replace(shift, shift === 'start' ? 'end' : 'start') : placement
          });
          isInternallySettingControlledProp = false;
        }

        function handlePopperListeners() {
          if (!instance.popperInstance) {
            return;
          } // Popper's scroll listeners make sense for `true` only. TODO: work out
          // how to only listen horizontal scroll for "horizontal" and vertical
          // scroll for "vertical"


          if (getIsEnabled() && getIsInitialBehavior()) {
            instance.popperInstance.disableEventListeners();
          }
        }

        function handleMouseMoveListener() {
          if (getIsEnabled()) {
            addListener();
          } else {
            resetReference();
          }
        }

        function triggerLastMouseMove() {
          if (getIsEnabled()) {
            onMouseMove(lastMouseMoveEvent);
          }
        }

        function addListener() {
          doc.addEventListener('mousemove', onMouseMove);
        }

        function removeListener() {
          doc.removeEventListener('mousemove', onMouseMove);
        }

        function onMouseMove(event) {
          var _lastMouseMoveEvent = lastMouseMoveEvent = event,
              clientX = _lastMouseMoveEvent.clientX,
              clientY = _lastMouseMoveEvent.clientY;

          if (!instance.popperInstance || !instance.state.currentPlacement) {
            return;
          } // If the instance is interactive, avoid updating the position unless it's
          // over the reference element


          var isCursorOverReference = closestCallback(event.target, function (el) {
            return el === reference;
          });
          var followCursor = instance.props.followCursor;
          var isHorizontal = followCursor === 'horizontal';
          var isVertical = followCursor === 'vertical';
          var isVerticalPlacement = includes$1(['top', 'bottom'], getBasePlacement(instance.state.currentPlacement)); // The virtual reference needs some size to prevent itself from overflowing

          var _getVirtualOffsets = getVirtualOffsets(popper, isVerticalPlacement),
              size = _getVirtualOffsets.size,
              x = _getVirtualOffsets.x,
              y = _getVirtualOffsets.y;

          if (isCursorOverReference || !instance.props.interactive) {
            // Preserve custom position ReferenceObjects, which may not be the
            // original targets reference passed as an argument
            if (originalReference === null) {
              originalReference = instance.popperInstance.reference;
            }

            instance.popperInstance.reference = {
              referenceNode: reference,
              // These `client` values don't get used by Popper.js if they are 0
              clientWidth: 0,
              clientHeight: 0,
              getBoundingClientRect: function getBoundingClientRect() {
                var rect = reference.getBoundingClientRect();
                return {
                  width: isVerticalPlacement ? size : 0,
                  height: isVerticalPlacement ? 0 : size,
                  top: (isHorizontal ? rect.top : clientY) - y,
                  bottom: (isHorizontal ? rect.bottom : clientY) + y,
                  left: (isVertical ? rect.left : clientX) - x,
                  right: (isVertical ? rect.right : clientX) + x
                };
              }
            };
            instance.popperInstance.update();
          }

          if (getIsInitialBehavior()) {
            removeListener();
          }
        }

        return {
          onAfterUpdate: function onAfterUpdate(_, partialProps) {
            if (!isInternallySettingControlledProp) {
              setUserProps(partialProps);

              if (partialProps.placement) {
                handlePlacement();
              }
            } // A new placement causes the popperInstance to be recreated


            if (partialProps.placement) {
              handlePopperListeners();
            } // Wait for `.update()` to set `instance.state.currentPlacement` to
            // the new placement


            requestAnimationFrame(triggerLastMouseMove);
          },
          onMount: function onMount() {
            triggerLastMouseMove();
            handlePopperListeners();
          },
          onShow: function onShow() {
            if (getIsManual()) {
              // Since there's no trigger event to use, we have to use these as
              // baseline coords
              mouseCoords = {
                clientX: 0,
                clientY: 0
              }; // Ensure `lastMouseMoveEvent` doesn't access any other properties
              // of a MouseEvent here

              lastMouseMoveEvent = mouseCoords;
              handlePlacement();
              handleMouseMoveListener();
            }
          },
          onTrigger: function onTrigger(_, event) {
            // Tapping on touch devices can trigger `mouseenter` then `focus`
            if (mouseCoords) {
              return;
            }

            if (isMouseEvent(event)) {
              mouseCoords = {
                clientX: event.clientX,
                clientY: event.clientY
              };
              lastMouseMoveEvent = event;
            }

            handlePlacement();
            handleMouseMoveListener();
          },
          onUntrigger: function onUntrigger() {
            // If untriggered before showing (`onHidden` will never be invoked)
            if (!instance.state.isVisible) {
              removeListener();
              mouseCoords = null;
            }
          },
          onHidden: function onHidden() {
            removeListener();
            resetReference();
            mouseCoords = null;
          }
        };
      }
    };
    function getVirtualOffsets(popper, isVerticalPlacement) {
      var size = isVerticalPlacement ? popper.offsetWidth : popper.offsetHeight;
      return {
        size: size,
        x: isVerticalPlacement ? size : 0,
        y: isVerticalPlacement ? 0 : size
      };
    }
    //# sourceMappingURL=tippy.esm.js.map

    function tipz(elem, opts = {}) {
      let tp;
      tp = tippy(elem, {
        followCursor: true,
        plugins: [followCursor],
        ...opts,
      });

      return {
        destroy() {
          tp.destroy();
        },
      }
    }

    /* src/components/Results/ResultsItem.svelte generated by Svelte v3.18.2 */
    const file$5 = "src/components/Results/ResultsItem.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let button;
    	let t_value = /*skinnedData*/ ctx[3].emoji + "";
    	let t;
    	let tipz_action;
    	let div_transition;
    	let current;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			t = text(t_value);
    			attr_dev(button, "class", "emoji svelte-lkfhpk");
    			set_style(button, "font-size", /*emojiSize*/ ctx[1] + "px");
    			set_style(button, "height", /*buttonHeight*/ ctx[2] + "px");
    			add_location(button, file$5, 21, 2, 501);
    			attr_dev(div, "class", "item svelte-lkfhpk");
    			add_location(div, file$5, 20, 0, 464);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(button, t);
    			current = true;

    			dispose = [
    				listen_dev(button, "click", /*click_handler*/ ctx[8], false, false, false),
    				action_destroyer(tipz_action = tipz.call(null, button, { content: /*tipContent*/ ctx[4] }))
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*skinnedData*/ 8) && t_value !== (t_value = /*skinnedData*/ ctx[3].emoji + "")) set_data_dev(t, t_value);

    			if (!current || dirty & /*emojiSize*/ 2) {
    				set_style(button, "font-size", /*emojiSize*/ ctx[1] + "px");
    			}

    			if (!current || dirty & /*buttonHeight*/ 4) {
    				set_style(button, "height", /*buttonHeight*/ ctx[2] + "px");
    			}

    			if (tipz_action && is_function(tipz_action.update) && dirty & /*tipContent*/ 16) tipz_action.update.call(null, { content: /*tipContent*/ ctx[4] });
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	const { selectedEmoji, selectedEmojiData } = getContext("appState");
    	let { data } = $$props;
    	let { tone } = $$props;
    	let { emojiSize } = $$props;
    	let { buttonHeight } = $$props;
    	const writable_props = ["data", "tone", "emojiSize", "buttonHeight"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ResultsItem> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => selectedEmoji.set(data.emoji);

    	$$self.$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("tone" in $$props) $$invalidate(6, tone = $$props.tone);
    		if ("emojiSize" in $$props) $$invalidate(1, emojiSize = $$props.emojiSize);
    		if ("buttonHeight" in $$props) $$invalidate(2, buttonHeight = $$props.buttonHeight);
    	};

    	$$self.$capture_state = () => {
    		return {
    			data,
    			tone,
    			emojiSize,
    			buttonHeight,
    			skinnedData,
    			tipContent
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("tone" in $$props) $$invalidate(6, tone = $$props.tone);
    		if ("emojiSize" in $$props) $$invalidate(1, emojiSize = $$props.emojiSize);
    		if ("buttonHeight" in $$props) $$invalidate(2, buttonHeight = $$props.buttonHeight);
    		if ("skinnedData" in $$props) $$invalidate(3, skinnedData = $$props.skinnedData);
    		if ("tipContent" in $$props) $$invalidate(4, tipContent = $$props.tipContent);
    	};

    	let skinnedData;
    	let tipContent;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*tone, data*/ 65) {
    			 $$invalidate(3, skinnedData = !tone || !data.skins ? data : data.skins[tone - 1]);
    		}

    		if ($$self.$$.dirty & /*skinnedData*/ 8) {
    			 $$invalidate(4, tipContent = skinnedData.shortcodes.map(x => `:${x}:`).join(", "));
    		}
    	};

    	return [
    		data,
    		emojiSize,
    		buttonHeight,
    		skinnedData,
    		tipContent,
    		selectedEmoji,
    		tone,
    		selectedEmojiData,
    		click_handler
    	];
    }

    class ResultsItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$5, safe_not_equal, {
    			data: 0,
    			tone: 6,
    			emojiSize: 1,
    			buttonHeight: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ResultsItem",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !("data" in props)) {
    			console.warn("<ResultsItem> was created without expected prop 'data'");
    		}

    		if (/*tone*/ ctx[6] === undefined && !("tone" in props)) {
    			console.warn("<ResultsItem> was created without expected prop 'tone'");
    		}

    		if (/*emojiSize*/ ctx[1] === undefined && !("emojiSize" in props)) {
    			console.warn("<ResultsItem> was created without expected prop 'emojiSize'");
    		}

    		if (/*buttonHeight*/ ctx[2] === undefined && !("buttonHeight" in props)) {
    			console.warn("<ResultsItem> was created without expected prop 'buttonHeight'");
    		}
    	}

    	get data() {
    		throw new Error("<ResultsItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<ResultsItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tone() {
    		throw new Error("<ResultsItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tone(value) {
    		throw new Error("<ResultsItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get emojiSize() {
    		throw new Error("<ResultsItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set emojiSize(value) {
    		throw new Error("<ResultsItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get buttonHeight() {
    		throw new Error("<ResultsItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set buttonHeight(value) {
    		throw new Error("<ResultsItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const TONES = {
      light: 1,
      mediumLight: 2,
      medium: 3,
      mediumDark: 4,
      dark: 5,
    };

    const TONES_EMOJIS = {
      light: '🏻',
      mediumLight: '🏼',
      medium: '🏽',
      mediumDark: '🏾',
      dark: '🏿',
    };

    /* src/components/Results/ToneSelector.svelte generated by Svelte v3.18.2 */
    const file$6 = "src/components/Results/ToneSelector.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (12:4) {#each Object.keys(TONES) as toneKey}
    function create_each_block(ctx) {
    	let option;
    	let t0_value = TONES_EMOJIS[/*toneKey*/ ctx[3]] + "";
    	let t0;
    	let t1;
    	let t2_value = /*toneKey*/ ctx[3] + "";
    	let t2;
    	let t3;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			option.__value = option_value_value = TONES[/*toneKey*/ ctx[3]];
    			option.value = option.__value;
    			add_location(option, file$6, 12, 4, 291);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    			append_dev(option, t2);
    			append_dev(option, t3);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(12:4) {#each Object.keys(TONES) as toneKey}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let select;
    	let option;
    	let option_value_value;
    	let dispose;
    	let each_value = Object.keys(TONES);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			option = element("option");
    			option.textContent = "neutral\n    ";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option.__value = option_value_value = null;
    			option.value = option.__value;
    			add_location(option, file$6, 8, 4, 195);
    			attr_dev(select, "class", "svelte-1ymawnf");
    			if (/*$tone*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[2].call(select));
    			add_location(select, file$6, 7, 0, 163);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$tone*/ ctx[0]);
    			dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[2]);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*TONES, Object, TONES_EMOJIS*/ 0) {
    				each_value = Object.keys(TONES);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*$tone*/ 1) {
    				select_option(select, /*$tone*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $tone;
    	const { tone } = getContext("appState");
    	validate_store(tone, "tone");
    	component_subscribe($$self, tone, value => $$invalidate(0, $tone = value));

    	function select_change_handler() {
    		$tone = select_value(this);
    		tone.set($tone);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("$tone" in $$props) tone.set($tone = $$props.$tone);
    	};

    	return [$tone, tone, select_change_handler];
    }

    class ToneSelector extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ToneSelector",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/components/Results/Clipboard.svelte generated by Svelte v3.18.2 */

    const { console: console_1 } = globals;
    const file$7 = "src/components/Results/Clipboard.svelte";

    // (35:1) {#if valueCopy != null}
    function create_if_block(ctx) {
    	let textarea;

    	const block = {
    		c: function create() {
    			textarea = element("textarea");
    			textarea.value = /*valueCopy*/ ctx[0];
    			attr_dev(textarea, "class", "svelte-1nqoalz");
    			add_location(textarea, file$7, 35, 2, 666);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, textarea, anchor);
    			/*textarea_binding*/ ctx[5](textarea);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*valueCopy*/ 1) {
    				prop_dev(textarea, "value", /*valueCopy*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(textarea);
    			/*textarea_binding*/ ctx[5](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(35:1) {#if valueCopy != null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div;
    	let t0;
    	let button;
    	let dispose;
    	let if_block = /*valueCopy*/ ctx[0] != null && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			button = element("button");
    			button.textContent = "Copy to clipboard";
    			attr_dev(button, "class", "copy-button svelte-1nqoalz");
    			add_location(button, file$7, 37, 1, 729);
    			attr_dev(div, "class", "clipboard svelte-1nqoalz");
    			add_location(div, file$7, 33, 0, 615);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t0);
    			append_dev(div, button);
    			dispose = listen_dev(button, "click", /*copy*/ ctx[2], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*valueCopy*/ ctx[0] != null) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let valueCopy = null;
    	let { value = null } = $$props;
    	let { onCopy } = $$props;
    	let areaDom;

    	async function copy() {
    		$$invalidate(0, valueCopy = value);
    		await tick();
    		areaDom.focus();
    		areaDom.select();
    		let message = "";

    		try {
    			const successful = document.execCommand("copy");

    			if (!successful) {
    				message = "Copying text was unsuccessful";
    			} else {
    				onCopy();
    			}
    		} catch(err) {
    			message = "Oops, unable to copy";
    		}

    		// we can notifi by event or storage about copy status
    		if (message.length) {
    			console.error(message);
    		}

    		$$invalidate(0, valueCopy = null);
    	}

    	const writable_props = ["value", "onCopy"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Clipboard> was created with unknown prop '${key}'`);
    	});

    	function textarea_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(1, areaDom = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("value" in $$props) $$invalidate(3, value = $$props.value);
    		if ("onCopy" in $$props) $$invalidate(4, onCopy = $$props.onCopy);
    	};

    	$$self.$capture_state = () => {
    		return { valueCopy, value, onCopy, areaDom };
    	};

    	$$self.$inject_state = $$props => {
    		if ("valueCopy" in $$props) $$invalidate(0, valueCopy = $$props.valueCopy);
    		if ("value" in $$props) $$invalidate(3, value = $$props.value);
    		if ("onCopy" in $$props) $$invalidate(4, onCopy = $$props.onCopy);
    		if ("areaDom" in $$props) $$invalidate(1, areaDom = $$props.areaDom);
    	};

    	return [valueCopy, areaDom, copy, value, onCopy, textarea_binding];
    }

    class Clipboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$7, safe_not_equal, { value: 3, onCopy: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Clipboard",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*onCopy*/ ctx[4] === undefined && !("onCopy" in props)) {
    			console_1.warn("<Clipboard> was created without expected prop 'onCopy'");
    		}
    	}

    	get value() {
    		throw new Error("<Clipboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Clipboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onCopy() {
    		throw new Error("<Clipboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onCopy(value) {
    		throw new Error("<Clipboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Results/ResultsSelected.svelte generated by Svelte v3.18.2 */
    const file$8 = "src/components/Results/ResultsSelected.svelte";

    // (19:0) {#if skinnedData}
    function create_if_block$1(ctx) {
    	let div3;
    	let div0;
    	let div0_transition;
    	let t0;
    	let p;
    	let button;
    	let t2;
    	let div2;
    	let header;
    	let div1;
    	let t3_value = /*skinnedData*/ ctx[0].emoji + "";
    	let t3;
    	let t4;
    	let h1;
    	let t5_value = /*skinnedData*/ ctx[0].annotation + "";
    	let t5;
    	let t6;
    	let dl;
    	let dt0;
    	let dd0;
    	let t8_value = /*skinnedData*/ ctx[0].name + "";
    	let t8;
    	let dt1;
    	let dd1;
    	let t10_value = /*skinnedData*/ ctx[0].hexcode + "";
    	let t10;
    	let dt2;
    	let dd2;
    	let t12_value = /*skinnedData*/ ctx[0].shortcodes.map(func).join(", ") + "";
    	let t12;
    	let dt3;
    	let dd3;
    	let t14_value = /*$selectedEmojiData*/ ctx[1].tags.join(", ") + "";
    	let t14;
    	let dt4;
    	let dd4;
    	let t16_value = (/*skinnedData*/ ctx[0].type === 0 ? "text" : "emoji") + "";
    	let t16;
    	let dt5;
    	let dd5;
    	let t18_value = /*$selectedEmojiData*/ ctx[1].order + "";
    	let t18;
    	let dt6;
    	let dd6;
    	let t20;
    	let dt7;
    	let dd7;
    	let t22;
    	let dt8;
    	let dd8;
    	let t24_value = /*$selectedEmojiData*/ ctx[1].version + "";
    	let t24;
    	let dl_transition;
    	let t25;
    	let div3_transition;
    	let current;
    	let dispose;
    	let if_block0 = /*$selectedEmojiData*/ ctx[1].skins && create_if_block_3(ctx);
    	let if_block1 = /*skinnedData*/ ctx[0].text && create_if_block_2(ctx);
    	let if_block2 = /*$selectedEmojiData*/ ctx[1].emoticon && create_if_block_1(ctx);

    	const clipboard = new Clipboard({
    			props: {
    				value: /*skinnedData*/ ctx[0].emoji,
    				onCopy: /*resetSelectedEmoji*/ ctx[8]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			t0 = space();
    			p = element("p");
    			button = element("button");
    			button.textContent = "Close";
    			t2 = space();
    			div2 = element("div");
    			header = element("header");
    			div1 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			h1 = element("h1");
    			t5 = text(t5_value);
    			t6 = space();
    			dl = element("dl");
    			if (if_block0) if_block0.c();
    			dt0 = element("dt");
    			dt0.textContent = "Name:";
    			dd0 = element("dd");
    			t8 = text(t8_value);
    			dt1 = element("dt");
    			dt1.textContent = "Hex Code:";
    			dd1 = element("dd");
    			t10 = text(t10_value);
    			dt2 = element("dt");
    			dt2.textContent = "Shortcodes:";
    			dd2 = element("dd");
    			t12 = text(t12_value);
    			dt3 = element("dt");
    			dt3.textContent = "Tags:";
    			dd3 = element("dd");
    			t14 = text(t14_value);
    			if (if_block1) if_block1.c();
    			dt4 = element("dt");
    			dt4.textContent = "Type:";
    			dd4 = element("dd");
    			t16 = text(t16_value);
    			dt5 = element("dt");
    			dt5.textContent = "Order:";
    			dd5 = element("dd");
    			t18 = text(t18_value);
    			dt6 = element("dt");
    			dt6.textContent = "Group:";
    			dd6 = element("dd");
    			t20 = text(/*parsedGroup*/ ctx[2]);
    			dt7 = element("dt");
    			dt7.textContent = "Subgroup:";
    			dd7 = element("dd");
    			t22 = text(/*parsedSubgroup*/ ctx[3]);
    			dt8 = element("dt");
    			dt8.textContent = "Version:";
    			dd8 = element("dd");
    			t24 = text(t24_value);
    			if (if_block2) if_block2.c();
    			t25 = space();
    			create_component(clipboard.$$.fragment);
    			attr_dev(div0, "class", "overlay svelte-dc5pm0");
    			add_location(div0, file$8, 20, 2, 724);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "svelte-dc5pm0");
    			add_location(button, file$8, 21, 19, 817);
    			attr_dev(p, "class", "close svelte-dc5pm0");
    			add_location(p, file$8, 21, 2, 800);
    			attr_dev(div1, "class", "emoji svelte-dc5pm0");
    			add_location(div1, file$8, 24, 6, 931);
    			attr_dev(h1, "class", "svelte-dc5pm0");
    			add_location(h1, file$8, 27, 6, 998);
    			attr_dev(header, "class", "svelte-dc5pm0");
    			add_location(header, file$8, 23, 4, 916);
    			attr_dev(dt0, "class", "svelte-dc5pm0");
    			add_location(dt0, file$8, 34, 6, 1182);
    			attr_dev(dd0, "class", "svelte-dc5pm0");
    			add_location(dd0, file$8, 35, 6, 1203);
    			attr_dev(dt1, "class", "svelte-dc5pm0");
    			add_location(dt1, file$8, 36, 6, 1237);
    			attr_dev(dd1, "class", "svelte-dc5pm0");
    			add_location(dd1, file$8, 37, 6, 1262);
    			attr_dev(dt2, "class", "svelte-dc5pm0");
    			add_location(dt2, file$8, 38, 6, 1299);
    			attr_dev(dd2, "class", "svelte-dc5pm0");
    			add_location(dd2, file$8, 39, 6, 1326);
    			attr_dev(dt3, "class", "svelte-dc5pm0");
    			add_location(dt3, file$8, 40, 6, 1396);
    			attr_dev(dd3, "class", "svelte-dc5pm0");
    			add_location(dd3, file$8, 41, 6, 1417);
    			attr_dev(dt4, "class", "svelte-dc5pm0");
    			add_location(dt4, file$8, 46, 6, 1569);
    			attr_dev(dd4, "class", "svelte-dc5pm0");
    			add_location(dd4, file$8, 47, 6, 1590);
    			attr_dev(dt5, "class", "svelte-dc5pm0");
    			add_location(dt5, file$8, 48, 6, 1649);
    			attr_dev(dd5, "class", "svelte-dc5pm0");
    			add_location(dd5, file$8, 49, 6, 1671);
    			attr_dev(dt6, "class", "svelte-dc5pm0");
    			add_location(dt6, file$8, 50, 6, 1713);
    			attr_dev(dd6, "class", "svelte-dc5pm0");
    			add_location(dd6, file$8, 51, 6, 1735);
    			attr_dev(dt7, "class", "svelte-dc5pm0");
    			add_location(dt7, file$8, 52, 6, 1764);
    			attr_dev(dd7, "class", "svelte-dc5pm0");
    			add_location(dd7, file$8, 53, 6, 1789);
    			attr_dev(dt8, "class", "svelte-dc5pm0");
    			add_location(dt8, file$8, 54, 6, 1821);
    			attr_dev(dd8, "class", "svelte-dc5pm0");
    			add_location(dd8, file$8, 55, 6, 1845);
    			attr_dev(dl, "class", "svelte-dc5pm0");
    			add_location(dl, file$8, 29, 4, 1050);
    			attr_dev(div2, "class", "content svelte-dc5pm0");
    			add_location(div2, file$8, 22, 2, 890);
    			attr_dev(div3, "class", "main svelte-dc5pm0");
    			add_location(div3, file$8, 19, 0, 687);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div3, t0);
    			append_dev(div3, p);
    			append_dev(p, button);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, header);
    			append_dev(header, div1);
    			append_dev(div1, t3);
    			append_dev(header, t4);
    			append_dev(header, h1);
    			append_dev(h1, t5);
    			append_dev(div2, t6);
    			append_dev(div2, dl);
    			if (if_block0) if_block0.m(dl, null);
    			append_dev(dl, dt0);
    			append_dev(dl, dd0);
    			append_dev(dd0, t8);
    			append_dev(dl, dt1);
    			append_dev(dl, dd1);
    			append_dev(dd1, t10);
    			append_dev(dl, dt2);
    			append_dev(dl, dd2);
    			append_dev(dd2, t12);
    			append_dev(dl, dt3);
    			append_dev(dl, dd3);
    			append_dev(dd3, t14);
    			if (if_block1) if_block1.m(dl, null);
    			append_dev(dl, dt4);
    			append_dev(dl, dd4);
    			append_dev(dd4, t16);
    			append_dev(dl, dt5);
    			append_dev(dl, dd5);
    			append_dev(dd5, t18);
    			append_dev(dl, dt6);
    			append_dev(dl, dd6);
    			append_dev(dd6, t20);
    			append_dev(dl, dt7);
    			append_dev(dl, dd7);
    			append_dev(dd7, t22);
    			append_dev(dl, dt8);
    			append_dev(dl, dd8);
    			append_dev(dd8, t24);
    			if (if_block2) if_block2.m(dl, null);
    			append_dev(div2, t25);
    			mount_component(clipboard, div2, null);
    			current = true;

    			dispose = [
    				listen_dev(div0, "click", /*resetSelectedEmoji*/ ctx[8], false, false, false),
    				listen_dev(button, "click", /*resetSelectedEmoji*/ ctx[8], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*skinnedData*/ 1) && t3_value !== (t3_value = /*skinnedData*/ ctx[0].emoji + "")) set_data_dev(t3, t3_value);
    			if ((!current || dirty & /*skinnedData*/ 1) && t5_value !== (t5_value = /*skinnedData*/ ctx[0].annotation + "")) set_data_dev(t5, t5_value);

    			if (/*$selectedEmojiData*/ ctx[1].skins) {
    				if (!if_block0) {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(dl, dt0);
    				} else {
    					transition_in(if_block0, 1);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if ((!current || dirty & /*skinnedData*/ 1) && t8_value !== (t8_value = /*skinnedData*/ ctx[0].name + "")) set_data_dev(t8, t8_value);
    			if ((!current || dirty & /*skinnedData*/ 1) && t10_value !== (t10_value = /*skinnedData*/ ctx[0].hexcode + "")) set_data_dev(t10, t10_value);
    			if ((!current || dirty & /*skinnedData*/ 1) && t12_value !== (t12_value = /*skinnedData*/ ctx[0].shortcodes.map(func).join(", ") + "")) set_data_dev(t12, t12_value);
    			if ((!current || dirty & /*$selectedEmojiData*/ 2) && t14_value !== (t14_value = /*$selectedEmojiData*/ ctx[1].tags.join(", ") + "")) set_data_dev(t14, t14_value);

    			if (/*skinnedData*/ ctx[0].text) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					if_block1.m(dl, dt4);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if ((!current || dirty & /*skinnedData*/ 1) && t16_value !== (t16_value = (/*skinnedData*/ ctx[0].type === 0 ? "text" : "emoji") + "")) set_data_dev(t16, t16_value);
    			if ((!current || dirty & /*$selectedEmojiData*/ 2) && t18_value !== (t18_value = /*$selectedEmojiData*/ ctx[1].order + "")) set_data_dev(t18, t18_value);
    			if (!current || dirty & /*parsedGroup*/ 4) set_data_dev(t20, /*parsedGroup*/ ctx[2]);
    			if (!current || dirty & /*parsedSubgroup*/ 8) set_data_dev(t22, /*parsedSubgroup*/ ctx[3]);
    			if ((!current || dirty & /*$selectedEmojiData*/ 2) && t24_value !== (t24_value = /*$selectedEmojiData*/ ctx[1].version + "")) set_data_dev(t24, t24_value);

    			if (/*$selectedEmojiData*/ ctx[1].emoticon) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_1(ctx);
    					if_block2.c();
    					if_block2.m(dl, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			const clipboard_changes = {};
    			if (dirty & /*skinnedData*/ 1) clipboard_changes.value = /*skinnedData*/ ctx[0].emoji;
    			clipboard.$set(clipboard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fade, {}, true);
    				div0_transition.run(1);
    			});

    			transition_in(if_block0);

    			add_render_callback(() => {
    				if (!dl_transition) dl_transition = create_bidirectional_transition(dl, fade, {}, true);
    				dl_transition.run(1);
    			});

    			transition_in(clipboard.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, fade, {}, true);
    				div3_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fade, {}, false);
    			div0_transition.run(0);
    			transition_out(if_block0);
    			if (!dl_transition) dl_transition = create_bidirectional_transition(dl, fade, {}, false);
    			dl_transition.run(0);
    			transition_out(clipboard.$$.fragment, local);
    			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, fade, {}, false);
    			div3_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (detaching && div0_transition) div0_transition.end();
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (detaching && dl_transition) dl_transition.end();
    			destroy_component(clipboard);
    			if (detaching && div3_transition) div3_transition.end();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(19:0) {#if skinnedData}",
    		ctx
    	});

    	return block;
    }

    // (31:6) {#if $selectedEmojiData.skins}
    function create_if_block_3(ctx) {
    	let dt;
    	let dd;
    	let current;
    	const toneselector = new ToneSelector({ $$inline: true });

    	const block = {
    		c: function create() {
    			dt = element("dt");
    			dt.textContent = "Tone";
    			dd = element("dd");
    			create_component(toneselector.$$.fragment);
    			attr_dev(dt, "class", "svelte-dc5pm0");
    			add_location(dt, file$8, 31, 8, 1116);
    			attr_dev(dd, "class", "svelte-dc5pm0");
    			add_location(dd, file$8, 32, 8, 1138);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, dt, anchor);
    			insert_dev(target, dd, anchor);
    			mount_component(toneselector, dd, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toneselector.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toneselector.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(dt);
    			if (detaching) detach_dev(dd);
    			destroy_component(toneselector);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(31:6) {#if $selectedEmojiData.skins}",
    		ctx
    	});

    	return block;
    }

    // (43:6) {#if skinnedData.text}
    function create_if_block_2(ctx) {
    	let dt;
    	let dd;
    	let t1_value = /*skinnedData*/ ctx[0].text + "";
    	let t1;

    	const block = {
    		c: function create() {
    			dt = element("dt");
    			dt.textContent = "Text:";
    			dd = element("dd");
    			t1 = text(t1_value);
    			attr_dev(dt, "class", "svelte-dc5pm0");
    			add_location(dt, file$8, 43, 8, 1500);
    			attr_dev(dd, "class", "svelte-dc5pm0");
    			add_location(dd, file$8, 44, 8, 1523);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, dt, anchor);
    			insert_dev(target, dd, anchor);
    			append_dev(dd, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*skinnedData*/ 1 && t1_value !== (t1_value = /*skinnedData*/ ctx[0].text + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(dt);
    			if (detaching) detach_dev(dd);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(43:6) {#if skinnedData.text}",
    		ctx
    	});

    	return block;
    }

    // (57:6) {#if $selectedEmojiData.emoticon}
    function create_if_block_1(ctx) {
    	let dt;
    	let dd;
    	let t1_value = /*$selectedEmojiData*/ ctx[1].emoticon + "";
    	let t1;

    	const block = {
    		c: function create() {
    			dt = element("dt");
    			dt.textContent = "Emoticon:";
    			dd = element("dd");
    			t1 = text(t1_value);
    			attr_dev(dt, "class", "svelte-dc5pm0");
    			add_location(dt, file$8, 57, 8, 1931);
    			attr_dev(dd, "class", "svelte-dc5pm0");
    			add_location(dd, file$8, 58, 8, 1958);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, dt, anchor);
    			insert_dev(target, dd, anchor);
    			append_dev(dd, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$selectedEmojiData*/ 2 && t1_value !== (t1_value = /*$selectedEmojiData*/ ctx[1].emoticon + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(dt);
    			if (detaching) detach_dev(dd);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(57:6) {#if $selectedEmojiData.emoticon}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let t;
    	let title_value;
    	let current;
    	let if_block = /*skinnedData*/ ctx[0] && create_if_block$1(ctx);

    	document.title = title_value = "" + ((/*skinnedData*/ ctx[0]
    	? `${/*skinnedData*/ ctx[0].emoji} ${/*skinnedData*/ ctx[0].name} | `
    	: "") + "Emojinfo");

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*skinnedData*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if ((!current || dirty & /*skinnedData*/ 1) && title_value !== (title_value = "" + ((/*skinnedData*/ ctx[0]
    			? `${/*skinnedData*/ ctx[0].emoji} ${/*skinnedData*/ ctx[0].name} | `
    			: "") + "Emojinfo"))) {
    				document.title = title_value;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const func = x => `:${x}:`;

    function instance$6($$self, $$props, $$invalidate) {
    	let $tone;
    	let $selectedEmojiData;
    	let $groups;
    	let $subgroups;
    	const { selectedEmoji, selectedEmojiData, groups, subgroups, tone } = getContext("appState");
    	validate_store(selectedEmojiData, "selectedEmojiData");
    	component_subscribe($$self, selectedEmojiData, value => $$invalidate(1, $selectedEmojiData = value));
    	validate_store(groups, "groups");
    	component_subscribe($$self, groups, value => $$invalidate(10, $groups = value));
    	validate_store(subgroups, "subgroups");
    	component_subscribe($$self, subgroups, value => $$invalidate(11, $subgroups = value));
    	validate_store(tone, "tone");
    	component_subscribe($$self, tone, value => $$invalidate(9, $tone = value));

    	const resetSelectedEmoji = () => {
    		selectedEmoji.set(null);
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("skinnedData" in $$props) $$invalidate(0, skinnedData = $$props.skinnedData);
    		if ("$tone" in $$props) tone.set($tone = $$props.$tone);
    		if ("$selectedEmojiData" in $$props) selectedEmojiData.set($selectedEmojiData = $$props.$selectedEmojiData);
    		if ("parsedGroup" in $$props) $$invalidate(2, parsedGroup = $$props.parsedGroup);
    		if ("$groups" in $$props) groups.set($groups = $$props.$groups);
    		if ("parsedSubgroup" in $$props) $$invalidate(3, parsedSubgroup = $$props.parsedSubgroup);
    		if ("$subgroups" in $$props) subgroups.set($subgroups = $$props.$subgroups);
    	};

    	let skinnedData;
    	let parsedGroup;
    	let parsedSubgroup;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$tone, $selectedEmojiData*/ 514) {
    			 $$invalidate(0, skinnedData = !$tone || !$selectedEmojiData || !$selectedEmojiData.skins
    			? $selectedEmojiData
    			: $selectedEmojiData.skins[$tone - 1]);
    		}

    		if ($$self.$$.dirty & /*skinnedData, $groups*/ 1025) {
    			 $$invalidate(2, parsedGroup = skinnedData && $groups ? $groups[skinnedData.group] : "");
    		}

    		if ($$self.$$.dirty & /*skinnedData, $subgroups*/ 2049) {
    			 $$invalidate(3, parsedSubgroup = skinnedData && $subgroups
    			? $subgroups[skinnedData.subgroup]
    			: "");
    		}
    	};

    	return [
    		skinnedData,
    		$selectedEmojiData,
    		parsedGroup,
    		parsedSubgroup,
    		selectedEmojiData,
    		groups,
    		subgroups,
    		tone,
    		resetSelectedEmoji
    	];
    }

    class ResultsSelected extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ResultsSelected",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/components/Results/Results.svelte generated by Svelte v3.18.2 */
    const file$9 = "src/components/Results/Results.svelte";

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    // (29:0) {#if $keyword.length}
    function create_if_block_4(ctx) {
    	let div;
    	let p;
    	let strong0;
    	let t0;
    	let t1;
    	let strong1;
    	let t2;
    	let t3;
    	let button;
    	let span;
    	let t5;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			strong0 = element("strong");
    			t0 = text(/*results*/ ctx[2]);
    			t1 = text(" results for ");
    			strong1 = element("strong");
    			t2 = text(/*$keyword*/ ctx[4]);
    			t3 = space();
    			button = element("button");
    			span = element("span");
    			span.textContent = "❌";
    			t5 = text(" clear");
    			attr_dev(strong0, "class", "svelte-p96264");
    			add_location(strong0, file$9, 31, 6, 789);
    			attr_dev(strong1, "class", "svelte-p96264");
    			add_location(strong1, file$9, 31, 45, 828);
    			attr_dev(span, "class", "clear svelte-p96264");
    			add_location(span, file$9, 32, 51, 907);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "svelte-p96264");
    			add_location(button, file$9, 32, 6, 862);
    			attr_dev(p, "class", "svelte-p96264");
    			add_location(p, file$9, 30, 4, 779);
    			attr_dev(div, "class", "results-header svelte-p96264");
    			add_location(div, file$9, 29, 2, 746);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, strong0);
    			append_dev(strong0, t0);
    			append_dev(p, t1);
    			append_dev(p, strong1);
    			append_dev(strong1, t2);
    			append_dev(p, t3);
    			append_dev(p, button);
    			append_dev(button, span);
    			append_dev(button, t5);
    			dispose = listen_dev(button, "click", /*resetSearch*/ ctx[14], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*results*/ 4) set_data_dev(t0, /*results*/ ctx[2]);
    			if (dirty & /*$keyword*/ 16) set_data_dev(t2, /*$keyword*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(29:0) {#if $keyword.length}",
    		ctx
    	});

    	return block;
    }

    // (42:4) {#if $mode !== 'simple' && group.subgroups.filter(x => x.items).length > 0}
    function create_if_block_3$1(ctx) {
    	let h2;
    	let t_value = parseName(/*group*/ ctx[16].name) + "";
    	let t;
    	let h2_intro;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t = text(t_value);
    			attr_dev(h2, "class", "svelte-p96264");
    			add_location(h2, file$9, 42, 6, 1190);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$data*/ 8 && t_value !== (t_value = parseName(/*group*/ ctx[16].name) + "")) set_data_dev(t, t_value);
    		},
    		i: function intro(local) {
    			if (!h2_intro) {
    				add_render_callback(() => {
    					h2_intro = create_in_transition(h2, fade, {});
    					h2_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(42:4) {#if $mode !== 'simple' && group.subgroups.filter(x => x.items).length > 0}",
    		ctx
    	});

    	return block;
    }

    // (46:6) {#if subgroup.items}
    function create_if_block$2(ctx) {
    	let t;
    	let each_1_anchor;
    	let current;
    	let if_block = /*$mode*/ ctx[5] === "hierarchized" && create_if_block_2$1(ctx);
    	let each_value_2 = /*subgroup*/ ctx[19].items;
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*$mode*/ ctx[5] === "hierarchized") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block_2$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*$data, $tone, $emojiSize, gridItemSize, $gender*/ 203) {
    				each_value_2 = /*subgroup*/ ctx[19].items;
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(46:6) {#if subgroup.items}",
    		ctx
    	});

    	return block;
    }

    // (47:8) {#if $mode === 'hierarchized'}
    function create_if_block_2$1(ctx) {
    	let h3;
    	let t_value = /*subgroup*/ ctx[19].name + "";
    	let t;
    	let h3_intro;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t = text(t_value);
    			attr_dev(h3, "class", "svelte-p96264");
    			add_location(h3, file$9, 47, 10, 1357);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$data*/ 8 && t_value !== (t_value = /*subgroup*/ ctx[19].name + "")) set_data_dev(t, t_value);
    		},
    		i: function intro(local) {
    			if (!h3_intro) {
    				add_render_callback(() => {
    					h3_intro = create_in_transition(h3, fade, {});
    					h3_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(47:8) {#if $mode === 'hierarchized'}",
    		ctx
    	});

    	return block;
    }

    // (51:10) {#if typeof item.gender === 'undefined' || $gender.includes(item.gender)}
    function create_if_block_1$1(ctx) {
    	let current;

    	const resultsitem = new ResultsItem({
    			props: {
    				data: /*item*/ ctx[22],
    				tone: /*$tone*/ ctx[7],
    				emojiSize: /*$emojiSize*/ ctx[0],
    				buttonHeight: /*gridItemSize*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(resultsitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(resultsitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const resultsitem_changes = {};
    			if (dirty & /*$data*/ 8) resultsitem_changes.data = /*item*/ ctx[22];
    			if (dirty & /*$tone*/ 128) resultsitem_changes.tone = /*$tone*/ ctx[7];
    			if (dirty & /*$emojiSize*/ 1) resultsitem_changes.emojiSize = /*$emojiSize*/ ctx[0];
    			if (dirty & /*gridItemSize*/ 2) resultsitem_changes.buttonHeight = /*gridItemSize*/ ctx[1];
    			resultsitem.$set(resultsitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(resultsitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(resultsitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(resultsitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(51:10) {#if typeof item.gender === 'undefined' || $gender.includes(item.gender)}",
    		ctx
    	});

    	return block;
    }

    // (50:8) {#each subgroup.items as item}
    function create_each_block_2(ctx) {
    	let show_if = typeof /*item*/ ctx[22].gender === "undefined" || /*$gender*/ ctx[6].includes(/*item*/ ctx[22].gender);
    	let if_block_anchor;
    	let current;
    	let if_block = show_if && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$data, $gender*/ 72) show_if = typeof /*item*/ ctx[22].gender === "undefined" || /*$gender*/ ctx[6].includes(/*item*/ ctx[22].gender);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(50:8) {#each subgroup.items as item}",
    		ctx
    	});

    	return block;
    }

    // (45:4) {#each group.subgroups as subgroup}
    function create_each_block_1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*subgroup*/ ctx[19].items && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*subgroup*/ ctx[19].items) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(45:4) {#each group.subgroups as subgroup}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#each $data as group}
    function create_each_block$1(ctx) {
    	let show_if = /*$mode*/ ctx[5] !== "simple" && /*group*/ ctx[16].subgroups.filter(func$1).length > 0;
    	let t;
    	let each_1_anchor;
    	let current;
    	let if_block = show_if && create_if_block_3$1(ctx);
    	let each_value_1 = /*group*/ ctx[16].subgroups;
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$mode, $data*/ 40) show_if = /*$mode*/ ctx[5] !== "simple" && /*group*/ ctx[16].subgroups.filter(func$1).length > 0;

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block_3$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*$data, $tone, $emojiSize, gridItemSize, $gender, $mode*/ 235) {
    				each_value_1 = /*group*/ ctx[16].subgroups;
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(41:2) {#each $data as group}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let t0;
    	let div;
    	let t1;
    	let current;
    	let if_block = /*$keyword*/ ctx[4].length && create_if_block_4(ctx);
    	let each_value = /*$data*/ ctx[3];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const resultsselected = new ResultsSelected({ $$inline: true });

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			create_component(resultsselected.$$.fragment);
    			attr_dev(div, "class", "grid svelte-p96264");
    			set_style(div, "grid-template-columns", "repeat(auto-fill, minmax(" + /*gridItemSize*/ ctx[1] + "px, 1fr))");
    			add_location(div, file$9, 37, 0, 976);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			insert_dev(target, t1, anchor);
    			mount_component(resultsselected, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$keyword*/ ctx[4].length) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_4(ctx);
    					if_block.c();
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*$data, $tone, $emojiSize, gridItemSize, $gender, $mode, parseName*/ 235) {
    				each_value = /*$data*/ ctx[3];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*gridItemSize*/ 2) {
    				set_style(div, "grid-template-columns", "repeat(auto-fill, minmax(" + /*gridItemSize*/ ctx[1] + "px, 1fr))");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(resultsselected.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(resultsselected.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(resultsselected, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const func$1 = x => x.items;

    function instance$7($$self, $$props, $$invalidate) {
    	let $emojiSize;
    	let $data;
    	let $keyword;
    	let $mode;
    	let $gender;
    	let $tone;
    	const { gender, data, mode, tone, emojiSize, keyword } = getContext("appState");
    	validate_store(gender, "gender");
    	component_subscribe($$self, gender, value => $$invalidate(6, $gender = value));
    	validate_store(data, "data");
    	component_subscribe($$self, data, value => $$invalidate(3, $data = value));
    	validate_store(mode, "mode");
    	component_subscribe($$self, mode, value => $$invalidate(5, $mode = value));
    	validate_store(tone, "tone");
    	component_subscribe($$self, tone, value => $$invalidate(7, $tone = value));
    	validate_store(emojiSize, "emojiSize");
    	component_subscribe($$self, emojiSize, value => $$invalidate(0, $emojiSize = value));
    	validate_store(keyword, "keyword");
    	component_subscribe($$self, keyword, value => $$invalidate(4, $keyword = value));

    	const resetSearch = () => {
    		set_store_value(keyword, $keyword = "");
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("factor" in $$props) $$invalidate(15, factor = $$props.factor);
    		if ("$emojiSize" in $$props) emojiSize.set($emojiSize = $$props.$emojiSize);
    		if ("gridItemSize" in $$props) $$invalidate(1, gridItemSize = $$props.gridItemSize);
    		if ("results" in $$props) $$invalidate(2, results = $$props.results);
    		if ("$data" in $$props) data.set($data = $$props.$data);
    		if ("$keyword" in $$props) keyword.set($keyword = $$props.$keyword);
    		if ("$mode" in $$props) mode.set($mode = $$props.$mode);
    		if ("$gender" in $$props) gender.set($gender = $$props.$gender);
    		if ("$tone" in $$props) tone.set($tone = $$props.$tone);
    	};

    	let factor;
    	let gridItemSize;
    	let results;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$emojiSize*/ 1) {
    			 $$invalidate(15, factor = $emojiSize / 60);
    		}

    		if ($$self.$$.dirty & /*$emojiSize, factor*/ 32769) {
    			 $$invalidate(1, gridItemSize = $emojiSize * (2.5 - factor));
    		}

    		if ($$self.$$.dirty & /*$data*/ 8) {
    			 $$invalidate(2, results = $data.reduce(
    				(acc, group) => acc + group.subgroups.reduce(
    					(subAcc, subgroup) => {
    						if (!subgroup.items) {
    							return subAcc;
    						}

    						return subAcc + subgroup.items.length;
    					},
    					0
    				),
    				0
    			));
    		}
    	};

    	return [
    		$emojiSize,
    		gridItemSize,
    		results,
    		$data,
    		$keyword,
    		$mode,
    		$gender,
    		$tone,
    		gender,
    		data,
    		mode,
    		tone,
    		emojiSize,
    		keyword,
    		resetSearch
    	];
    }

    class Results extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Results",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/components/SideBar/SideBarGroup.svelte generated by Svelte v3.18.2 */

    const file$a = "src/components/SideBar/SideBarGroup.svelte";

    function create_fragment$a(ctx) {
    	let div;
    	let h3;
    	let t0;
    	let t1;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			if (default_slot) default_slot.c();
    			attr_dev(h3, "class", "svelte-1p47oq");
    			add_location(h3, file$a, 5, 2, 48);
    			attr_dev(div, "class", "svelte-1p47oq");
    			add_location(div, file$a, 4, 0, 40);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(h3, t0);
    			append_dev(div, t1);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);

    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 2) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[1], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { title } = $$props;
    	const writable_props = ["title"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SideBarGroup> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { title };
    	};

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    	};

    	return [title, $$scope, $$slots];
    }

    class SideBarGroup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$a, safe_not_equal, { title: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SideBarGroup",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !("title" in props)) {
    			console.warn("<SideBarGroup> was created without expected prop 'title'");
    		}
    	}

    	get title() {
    		throw new Error("<SideBarGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<SideBarGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/SideBar/ModeSelector.svelte generated by Svelte v3.18.2 */
    const file$b = "src/components/SideBar/ModeSelector.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (11:4) {#each Object.keys(MODES) as modeKey}
    function create_each_block$2(ctx) {
    	let li;
    	let label;
    	let input;
    	let input_value_value;
    	let t0;
    	let t1_value = MODES[/*modeKey*/ ctx[4]].title + "";
    	let t1;
    	let t2;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(input, "type", "radio");
    			input.__value = input_value_value = MODES[/*modeKey*/ ctx[4]].value;
    			input.value = input.__value;
    			/*$$binding_groups*/ ctx[3][0].push(input);
    			add_location(input, file$b, 13, 8, 334);
    			attr_dev(label, "class", "svelte-1ycochu");
    			add_location(label, file$b, 12, 6, 318);
    			attr_dev(li, "class", "svelte-1ycochu");
    			add_location(li, file$b, 11, 4, 307);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, label);
    			append_dev(label, input);
    			input.checked = input.__value === /*$mode*/ ctx[0];
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(li, t2);
    			dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[2]);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$mode*/ 1) {
    				input.checked = input.__value === /*$mode*/ ctx[0];
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			/*$$binding_groups*/ ctx[3][0].splice(/*$$binding_groups*/ ctx[3][0].indexOf(input), 1);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(11:4) {#each Object.keys(MODES) as modeKey}",
    		ctx
    	});

    	return block;
    }

    // (9:0) <SideBarGroup title="Emoji Organization">
    function create_default_slot(ctx) {
    	let ul;
    	let each_value = Object.keys(MODES);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "wrapper svelte-1ycochu");
    			add_location(ul, file$b, 9, 2, 240);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*MODES, Object, $mode*/ 1) {
    				each_value = Object.keys(MODES);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(9:0) <SideBarGroup title=\\\"Emoji Organization\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let current;

    	const sidebargroup = new SideBarGroup({
    			props: {
    				title: "Emoji Organization",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(sidebargroup.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(sidebargroup, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const sidebargroup_changes = {};

    			if (dirty & /*$$scope, $mode*/ 129) {
    				sidebargroup_changes.$$scope = { dirty, ctx };
    			}

    			sidebargroup.$set(sidebargroup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sidebargroup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sidebargroup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sidebargroup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $mode;
    	const { mode } = getContext("appState");
    	validate_store(mode, "mode");
    	component_subscribe($$self, mode, value => $$invalidate(0, $mode = value));
    	const $$binding_groups = [[]];

    	function input_change_handler() {
    		$mode = this.__value;
    		mode.set($mode);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("$mode" in $$props) mode.set($mode = $$props.$mode);
    	};

    	return [$mode, mode, input_change_handler, $$binding_groups];
    }

    class ModeSelector extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ModeSelector",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    var justThrottle = throttle;

    function throttle(fn, interval, callFirst) {
      var wait = false;
      var callNow = false;
      return function() {
        callNow = callFirst && !wait;
        var context = this;
        var args = arguments;
        if (!wait) {
          wait = true;
          setTimeout(function() {
            wait = false;
            if (!callFirst) {
              return fn.apply(context, args);
            }
          }, interval);
        }
        if (callNow) {
          callNow = false;
          return fn.apply(this, arguments);
        }
      };
    }

    /* src/components/SideBar/SizeSelector.svelte generated by Svelte v3.18.2 */
    const file$c = "src/components/SideBar/SizeSelector.svelte";

    // (13:0) <SideBarGroup title="Emoji size">
    function create_default_slot$1(ctx) {
    	let input;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "range");
    			attr_dev(input, "min", "16");
    			attr_dev(input, "max", "64");
    			attr_dev(input, "step", "2");
    			input.value = /*$emojiSize*/ ctx[0];
    			attr_dev(input, "class", "svelte-xl5k1w");
    			add_location(input, file$c, 13, 2, 312);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			dispose = listen_dev(input, "change", justThrottle(/*updateEmojiSize*/ ctx[2], 60), false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$emojiSize*/ 1) {
    				prop_dev(input, "value", /*$emojiSize*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(13:0) <SideBarGroup title=\\\"Emoji size\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let current;

    	const sidebargroup = new SideBarGroup({
    			props: {
    				title: "Emoji size",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(sidebargroup.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(sidebargroup, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const sidebargroup_changes = {};

    			if (dirty & /*$$scope, $emojiSize*/ 9) {
    				sidebargroup_changes.$$scope = { dirty, ctx };
    			}

    			sidebargroup.$set(sidebargroup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sidebargroup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sidebargroup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sidebargroup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $emojiSize;
    	const { emojiSize } = getContext("appState");
    	validate_store(emojiSize, "emojiSize");
    	component_subscribe($$self, emojiSize, value => $$invalidate(0, $emojiSize = value));

    	const updateEmojiSize = e => {
    		emojiSize.set(Number(e.target.value));
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("$emojiSize" in $$props) emojiSize.set($emojiSize = $$props.$emojiSize);
    	};

    	return [$emojiSize, emojiSize, updateEmojiSize];
    }

    class SizeSelector extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SizeSelector",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/components/SideBar/GenderSelector.svelte generated by Svelte v3.18.2 */
    const file$d = "src/components/SideBar/GenderSelector.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (11:2) {#each Object.keys(GENDERS) as genderKey}
    function create_each_block$3(ctx) {
    	let li;
    	let label;
    	let input;
    	let input_value_value;
    	let t0;
    	let t1_value = /*genderKey*/ ctx[4] + "";
    	let t1;
    	let t2;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(input, "type", "checkbox");
    			input.__value = input_value_value = Number(GENDERS[/*genderKey*/ ctx[4]]);
    			input.value = input.__value;
    			/*$$binding_groups*/ ctx[3][0].push(input);
    			add_location(input, file$d, 13, 8, 324);
    			attr_dev(label, "class", "svelte-mqx2jw");
    			add_location(label, file$d, 12, 6, 308);
    			attr_dev(li, "class", "svelte-mqx2jw");
    			add_location(li, file$d, 11, 4, 297);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, label);
    			append_dev(label, input);
    			input.checked = ~/*$gender*/ ctx[0].indexOf(input.__value);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(li, t2);
    			dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[2]);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$gender*/ 1) {
    				input.checked = ~/*$gender*/ ctx[0].indexOf(input.__value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			/*$$binding_groups*/ ctx[3][0].splice(/*$$binding_groups*/ ctx[3][0].indexOf(input), 1);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(11:2) {#each Object.keys(GENDERS) as genderKey}",
    		ctx
    	});

    	return block;
    }

    // (9:0) <SideBarGroup title="Filter by gender">
    function create_default_slot$2(ctx) {
    	let ul;
    	let each_value = Object.keys(GENDERS);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-mqx2jw");
    			add_location(ul, file$d, 9, 2, 244);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, GENDERS, Number, $gender*/ 1) {
    				each_value = Object.keys(GENDERS);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(9:0) <SideBarGroup title=\\\"Filter by gender\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let current;

    	const sidebargroup = new SideBarGroup({
    			props: {
    				title: "Filter by gender",
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(sidebargroup.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(sidebargroup, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const sidebargroup_changes = {};

    			if (dirty & /*$$scope, $gender*/ 129) {
    				sidebargroup_changes.$$scope = { dirty, ctx };
    			}

    			sidebargroup.$set(sidebargroup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sidebargroup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sidebargroup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sidebargroup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $gender;
    	const { gender } = getContext("appState");
    	validate_store(gender, "gender");
    	component_subscribe($$self, gender, value => $$invalidate(0, $gender = value));
    	const $$binding_groups = [[]];

    	function input_change_handler() {
    		$gender = get_binding_group_value($$binding_groups[0]);
    		gender.set($gender);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("$gender" in $$props) gender.set($gender = $$props.$gender);
    	};

    	return [$gender, gender, input_change_handler, $$binding_groups];
    }

    class GenderSelector extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GenderSelector",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/components/SideBar/ToneSelector.svelte generated by Svelte v3.18.2 */
    const file$e = "src/components/SideBar/ToneSelector.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (14:4) {#each Object.keys(TONES) as toneKey}
    function create_each_block$4(ctx) {
    	let option;
    	let t0_value = TONES_EMOJIS[/*toneKey*/ ctx[3]] + "";
    	let t0;
    	let t1;
    	let t2_value = /*toneKey*/ ctx[3] + "";
    	let t2;
    	let t3;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			option.__value = option_value_value = TONES[/*toneKey*/ ctx[3]];
    			option.value = option.__value;
    			add_location(option, file$e, 14, 4, 379);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    			append_dev(option, t2);
    			append_dev(option, t3);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(14:4) {#each Object.keys(TONES) as toneKey}",
    		ctx
    	});

    	return block;
    }

    // (9:0) <SideBarGroup title="Select tone">
    function create_default_slot$3(ctx) {
    	let select;
    	let option;
    	let option_value_value;
    	let dispose;
    	let each_value = Object.keys(TONES);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			option = element("option");
    			option.textContent = "neutral\n    ";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option.__value = option_value_value = null;
    			option.value = option.__value;
    			add_location(option, file$e, 10, 4, 283);
    			attr_dev(select, "class", "svelte-1xbizij");
    			if (/*$tone*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[2].call(select));
    			add_location(select, file$e, 9, 2, 251);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$tone*/ ctx[0]);
    			dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[2]);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*TONES, Object, TONES_EMOJIS*/ 0) {
    				each_value = Object.keys(TONES);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*$tone*/ 1) {
    				select_option(select, /*$tone*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(9:0) <SideBarGroup title=\\\"Select tone\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let current;

    	const sidebargroup = new SideBarGroup({
    			props: {
    				title: "Select tone",
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(sidebargroup.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(sidebargroup, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const sidebargroup_changes = {};

    			if (dirty & /*$$scope, $tone*/ 65) {
    				sidebargroup_changes.$$scope = { dirty, ctx };
    			}

    			sidebargroup.$set(sidebargroup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sidebargroup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sidebargroup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sidebargroup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $tone;
    	const { tone } = getContext("appState");
    	validate_store(tone, "tone");
    	component_subscribe($$self, tone, value => $$invalidate(0, $tone = value));

    	function select_change_handler() {
    		$tone = select_value(this);
    		tone.set($tone);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("$tone" in $$props) tone.set($tone = $$props.$tone);
    	};

    	return [$tone, tone, select_change_handler];
    }

    class ToneSelector$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ToneSelector",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/components/SideBar/SideBar.svelte generated by Svelte v3.18.2 */
    const file$f = "src/components/SideBar/SideBar.svelte";

    // (12:0) {#if $menuOpen}
    function create_if_block$3(ctx) {
    	let div;
    	let div_transition;
    	let current;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "overlay svelte-n19kam");
    			add_location(div, file$f, 12, 2, 386);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			current = true;
    			dispose = listen_dev(div, "click", /*toggleMenu*/ ctx[2], false, false, false);
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(12:0) {#if $menuOpen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let t0;
    	let aside;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let div;
    	let button;
    	let current;
    	let dispose;
    	let if_block = /*$menuOpen*/ ctx[0] && create_if_block$3(ctx);
    	const modeselector = new ModeSelector({ $$inline: true });
    	const sizeselector = new SizeSelector({ $$inline: true });
    	const genderselector = new GenderSelector({ $$inline: true });
    	const toneselector = new ToneSelector$1({ $$inline: true });

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			aside = element("aside");
    			create_component(modeselector.$$.fragment);
    			t1 = space();
    			create_component(sizeselector.$$.fragment);
    			t2 = space();
    			create_component(genderselector.$$.fragment);
    			t3 = space();
    			create_component(toneselector.$$.fragment);
    			t4 = space();
    			div = element("div");
    			button = element("button");
    			button.textContent = "Close";
    			attr_dev(button, "class", "svelte-n19kam");
    			add_location(button, file$f, 21, 4, 611);
    			attr_dev(div, "class", "button-wrapper svelte-n19kam");
    			add_location(div, file$f, 20, 2, 578);
    			attr_dev(aside, "class", "svelte-n19kam");
    			toggle_class(aside, "menuOpen", /*$menuOpen*/ ctx[0]);
    			add_location(aside, file$f, 15, 0, 461);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, aside, anchor);
    			mount_component(modeselector, aside, null);
    			append_dev(aside, t1);
    			mount_component(sizeselector, aside, null);
    			append_dev(aside, t2);
    			mount_component(genderselector, aside, null);
    			append_dev(aside, t3);
    			mount_component(toneselector, aside, null);
    			append_dev(aside, t4);
    			append_dev(aside, div);
    			append_dev(div, button);
    			current = true;
    			dispose = listen_dev(button, "click", /*toggleMenu*/ ctx[2], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$menuOpen*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*$menuOpen*/ 1) {
    				toggle_class(aside, "menuOpen", /*$menuOpen*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(modeselector.$$.fragment, local);
    			transition_in(sizeselector.$$.fragment, local);
    			transition_in(genderselector.$$.fragment, local);
    			transition_in(toneselector.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(modeselector.$$.fragment, local);
    			transition_out(sizeselector.$$.fragment, local);
    			transition_out(genderselector.$$.fragment, local);
    			transition_out(toneselector.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(aside);
    			destroy_component(modeselector);
    			destroy_component(sizeselector);
    			destroy_component(genderselector);
    			destroy_component(toneselector);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $menuOpen;
    	const { menuOpen, toggleMenu } = getContext("appState");
    	validate_store(menuOpen, "menuOpen");
    	component_subscribe($$self, menuOpen, value => $$invalidate(0, $menuOpen = value));

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("$menuOpen" in $$props) menuOpen.set($menuOpen = $$props.$menuOpen);
    	};

    	return [$menuOpen, menuOpen, toggleMenu];
    }

    class SideBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SideBar",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src/components/Preloader.svelte generated by Svelte v3.18.2 */

    const file$g = "src/components/Preloader.svelte";

    function create_fragment$g(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "preloader svelte-1gplb2h");
    			add_location(div, file$g, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Preloader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Preloader",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src/components/Footer.svelte generated by Svelte v3.18.2 */

    const file$h = "src/components/Footer.svelte";

    function create_fragment$h(ctx) {
    	let footer;
    	let h3;
    	let t1;
    	let p;
    	let t2;
    	let a;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			h3 = element("h3");
    			h3.textContent = "Emojinfo";
    			t1 = space();
    			p = element("p");
    			t2 = text("Created by ");
    			a = element("a");
    			a.textContent = "José Manuel Lucas";
    			add_location(h3, file$h, 1, 2, 11);
    			attr_dev(a, "href", "https://jmlweb.es");
    			attr_dev(a, "class", "svelte-1rhayxk");
    			add_location(a, file$h, 2, 16, 45);
    			add_location(p, file$h, 2, 2, 31);
    			attr_dev(footer, "class", "svelte-1rhayxk");
    			add_location(footer, file$h, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, h3);
    			append_dev(footer, t1);
    			append_dev(footer, p);
    			append_dev(p, t2);
    			append_dev(p, a);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src/components/App.svelte generated by Svelte v3.18.2 */
    const file$i = "src/components/App.svelte";

    // (24:2) <div slot="top">
    function create_top_slot(ctx) {
    	let div;
    	let current;
    	const topbar = new TopBar({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(topbar.$$.fragment);
    			attr_dev(div, "slot", "top");
    			add_location(div, file$i, 23, 2, 541);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(topbar, div, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(topbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(topbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(topbar);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_top_slot.name,
    		type: "slot",
    		source: "(24:2) <div slot=\\\"top\\\">",
    		ctx
    	});

    	return block;
    }

    // (30:4) {:else}
    function create_else_block(ctx) {
    	let current;
    	const results = new Results({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(results.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(results, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(results.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(results.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(results, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(30:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (28:4) {#if $isLoading}
    function create_if_block$4(ctx) {
    	let current;
    	const preloader = new Preloader({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(preloader.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(preloader, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(preloader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(preloader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(preloader, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(28:4) {#if $isLoading}",
    		ctx
    	});

    	return block;
    }

    // (27:2) <div slot="body">
    function create_body_slot(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$4, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$isLoading*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "slot", "body");
    			add_location(div, file$i, 26, 2, 584);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_body_slot.name,
    		type: "slot",
    		source: "(27:2) <div slot=\\\"body\\\">",
    		ctx
    	});

    	return block;
    }

    // (34:2) <div slot="footer">
    function create_footer_slot(ctx) {
    	let div;
    	let current;
    	const footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(footer.$$.fragment);
    			attr_dev(div, "slot", "footer");
    			add_location(div, file$i, 33, 2, 694);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(footer, div, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_footer_slot.name,
    		type: "slot",
    		source: "(34:2) <div slot=\\\"footer\\\">",
    		ctx
    	});

    	return block;
    }

    // (23:0) <MainLayout>
    function create_default_slot$4(ctx) {
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = space();
    			t1 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(23:0) <MainLayout>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let t;
    	let current;

    	const mainlayout = new MainLayout({
    			props: {
    				$$slots: {
    					default: [create_default_slot$4],
    					footer: [create_footer_slot],
    					body: [create_body_slot],
    					top: [create_top_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const sidebar = new SideBar({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(mainlayout.$$.fragment);
    			t = space();
    			create_component(sidebar.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(mainlayout, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(sidebar, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const mainlayout_changes = {};

    			if (dirty & /*$$scope, $isLoading*/ 9) {
    				mainlayout_changes.$$scope = { dirty, ctx };
    			}

    			mainlayout.$set(mainlayout_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mainlayout.$$.fragment, local);
    			transition_in(sidebar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mainlayout.$$.fragment, local);
    			transition_out(sidebar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mainlayout, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(sidebar, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let $menuOpen;
    	let $isLoading;
    	validate_store(menuOpen, "menuOpen");
    	component_subscribe($$self, menuOpen, $$value => $$invalidate(1, $menuOpen = $$value));
    	validate_store(isLoading, "isLoading");
    	component_subscribe($$self, isLoading, $$value => $$invalidate(0, $isLoading = $$value));

    	const toggleMenu = () => {
    		menuOpen.set(!$menuOpen);
    	};

    	setContext("appState", { ...store, toggleMenu });

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("$menuOpen" in $$props) menuOpen.set($menuOpen = $$props.$menuOpen);
    		if ("$isLoading" in $$props) isLoading.set($isLoading = $$props.$isLoading);
    	};

    	return [$isLoading];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
