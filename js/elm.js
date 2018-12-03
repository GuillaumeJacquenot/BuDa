
(function() {
'use strict';

function F2(fun)
{
  function wrapper(a) { return function(b) { return fun(a,b); }; }
  wrapper.arity = 2;
  wrapper.func = fun;
  return wrapper;
}

function F3(fun)
{
  function wrapper(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  }
  wrapper.arity = 3;
  wrapper.func = fun;
  return wrapper;
}

function F4(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  }
  wrapper.arity = 4;
  wrapper.func = fun;
  return wrapper;
}

function F5(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  }
  wrapper.arity = 5;
  wrapper.func = fun;
  return wrapper;
}

function F6(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  }
  wrapper.arity = 6;
  wrapper.func = fun;
  return wrapper;
}

function F7(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  }
  wrapper.arity = 7;
  wrapper.func = fun;
  return wrapper;
}

function F8(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  }
  wrapper.arity = 8;
  wrapper.func = fun;
  return wrapper;
}

function F9(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  }
  wrapper.arity = 9;
  wrapper.func = fun;
  return wrapper;
}

function A2(fun, a, b)
{
  return fun.arity === 2
    ? fun.func(a, b)
    : fun(a)(b);
}
function A3(fun, a, b, c)
{
  return fun.arity === 3
    ? fun.func(a, b, c)
    : fun(a)(b)(c);
}
function A4(fun, a, b, c, d)
{
  return fun.arity === 4
    ? fun.func(a, b, c, d)
    : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e)
{
  return fun.arity === 5
    ? fun.func(a, b, c, d, e)
    : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f)
{
  return fun.arity === 6
    ? fun.func(a, b, c, d, e, f)
    : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g)
{
  return fun.arity === 7
    ? fun.func(a, b, c, d, e, f, g)
    : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h)
{
  return fun.arity === 8
    ? fun.func(a, b, c, d, e, f, g, h)
    : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i)
{
  return fun.arity === 9
    ? fun.func(a, b, c, d, e, f, g, h, i)
    : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}

//import Native.List //

var _elm_lang$core$Native_Array = function() {

// A RRB-Tree has two distinct data types.
// Leaf -> "height"  is always 0
//         "table"   is an array of elements
// Node -> "height"  is always greater than 0
//         "table"   is an array of child nodes
//         "lengths" is an array of accumulated lengths of the child nodes

// M is the maximal table size. 32 seems fast. E is the allowed increase
// of search steps when concatting to find an index. Lower values will
// decrease balancing, but will increase search steps.
var M = 32;
var E = 2;

// An empty array.
var empty = {
	ctor: '_Array',
	height: 0,
	table: []
};


function get(i, array)
{
	if (i < 0 || i >= length(array))
	{
		throw new Error(
			'Index ' + i + ' is out of range. Check the length of ' +
			'your array first or use getMaybe or getWithDefault.');
	}
	return unsafeGet(i, array);
}


function unsafeGet(i, array)
{
	for (var x = array.height; x > 0; x--)
	{
		var slot = i >> (x * 5);
		while (array.lengths[slot] <= i)
		{
			slot++;
		}
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array = array.table[slot];
	}
	return array.table[i];
}


// Sets the value at the index i. Only the nodes leading to i will get
// copied and updated.
function set(i, item, array)
{
	if (i < 0 || length(array) <= i)
	{
		return array;
	}
	return unsafeSet(i, item, array);
}


function unsafeSet(i, item, array)
{
	array = nodeCopy(array);

	if (array.height === 0)
	{
		array.table[i] = item;
	}
	else
	{
		var slot = getSlot(i, array);
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array.table[slot] = unsafeSet(i, item, array.table[slot]);
	}
	return array;
}


function initialize(len, f)
{
	if (len <= 0)
	{
		return empty;
	}
	var h = Math.floor( Math.log(len) / Math.log(M) );
	return initialize_(f, h, 0, len);
}

function initialize_(f, h, from, to)
{
	if (h === 0)
	{
		var table = new Array((to - from) % (M + 1));
		for (var i = 0; i < table.length; i++)
		{
		  table[i] = f(from + i);
		}
		return {
			ctor: '_Array',
			height: 0,
			table: table
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = initialize_(f, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i-1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

function fromList(list)
{
	if (list.ctor === '[]')
	{
		return empty;
	}

	// Allocate M sized blocks (table) and write list elements to it.
	var table = new Array(M);
	var nodes = [];
	var i = 0;

	while (list.ctor !== '[]')
	{
		table[i] = list._0;
		list = list._1;
		i++;

		// table is full, so we can push a leaf containing it into the
		// next node.
		if (i === M)
		{
			var leaf = {
				ctor: '_Array',
				height: 0,
				table: table
			};
			fromListPush(leaf, nodes);
			table = new Array(M);
			i = 0;
		}
	}

	// Maybe there is something left on the table.
	if (i > 0)
	{
		var leaf = {
			ctor: '_Array',
			height: 0,
			table: table.splice(0, i)
		};
		fromListPush(leaf, nodes);
	}

	// Go through all of the nodes and eventually push them into higher nodes.
	for (var h = 0; h < nodes.length - 1; h++)
	{
		if (nodes[h].table.length > 0)
		{
			fromListPush(nodes[h], nodes);
		}
	}

	var head = nodes[nodes.length - 1];
	if (head.height > 0 && head.table.length === 1)
	{
		return head.table[0];
	}
	else
	{
		return head;
	}
}

// Push a node into a higher node as a child.
function fromListPush(toPush, nodes)
{
	var h = toPush.height;

	// Maybe the node on this height does not exist.
	if (nodes.length === h)
	{
		var node = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
		nodes.push(node);
	}

	nodes[h].table.push(toPush);
	var len = length(toPush);
	if (nodes[h].lengths.length > 0)
	{
		len += nodes[h].lengths[nodes[h].lengths.length - 1];
	}
	nodes[h].lengths.push(len);

	if (nodes[h].table.length === M)
	{
		fromListPush(nodes[h], nodes);
		nodes[h] = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
	}
}

// Pushes an item via push_ to the bottom right of a tree.
function push(item, a)
{
	var pushed = push_(item, a);
	if (pushed !== null)
	{
		return pushed;
	}

	var newTree = create(item, a.height);
	return siblise(a, newTree);
}

// Recursively tries to push an item to the bottom-right most
// tree possible. If there is no space left for the item,
// null will be returned.
function push_(item, a)
{
	// Handle resursion stop at leaf level.
	if (a.height === 0)
	{
		if (a.table.length < M)
		{
			var newA = {
				ctor: '_Array',
				height: 0,
				table: a.table.slice()
			};
			newA.table.push(item);
			return newA;
		}
		else
		{
		  return null;
		}
	}

	// Recursively push
	var pushed = push_(item, botRight(a));

	// There was space in the bottom right tree, so the slot will
	// be updated.
	if (pushed !== null)
	{
		var newA = nodeCopy(a);
		newA.table[newA.table.length - 1] = pushed;
		newA.lengths[newA.lengths.length - 1]++;
		return newA;
	}

	// When there was no space left, check if there is space left
	// for a new slot with a tree which contains only the item
	// at the bottom.
	if (a.table.length < M)
	{
		var newSlot = create(item, a.height - 1);
		var newA = nodeCopy(a);
		newA.table.push(newSlot);
		newA.lengths.push(newA.lengths[newA.lengths.length - 1] + length(newSlot));
		return newA;
	}
	else
	{
		return null;
	}
}

// Converts an array into a list of elements.
function toList(a)
{
	return toList_(_elm_lang$core$Native_List.Nil, a);
}

function toList_(list, a)
{
	for (var i = a.table.length - 1; i >= 0; i--)
	{
		list =
			a.height === 0
				? _elm_lang$core$Native_List.Cons(a.table[i], list)
				: toList_(list, a.table[i]);
	}
	return list;
}

// Maps a function over the elements of an array.
function map(f, a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? f(a.table[i])
				: map(f, a.table[i]);
	}
	return newA;
}

// Maps a function over the elements with their index as first argument.
function indexedMap(f, a)
{
	return indexedMap_(f, a, 0);
}

function indexedMap_(f, a, from)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? A2(f, from + i, a.table[i])
				: indexedMap_(f, a.table[i], i == 0 ? from : from + a.lengths[i - 1]);
	}
	return newA;
}

function foldl(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = foldl(f, b, a.table[i]);
		}
	}
	return b;
}

function foldr(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = a.table.length; i--; )
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = a.table.length; i--; )
		{
			b = foldr(f, b, a.table[i]);
		}
	}
	return b;
}

// TODO: currently, it slices the right, then the left. This can be
// optimized.
function slice(from, to, a)
{
	if (from < 0)
	{
		from += length(a);
	}
	if (to < 0)
	{
		to += length(a);
	}
	return sliceLeft(from, sliceRight(to, a));
}

function sliceRight(to, a)
{
	if (to === length(a))
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(0, to);
		return newA;
	}

	// Slice the right recursively.
	var right = getSlot(to, a);
	var sliced = sliceRight(to - (right > 0 ? a.lengths[right - 1] : 0), a.table[right]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (right === 0)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(0, right),
		lengths: a.lengths.slice(0, right)
	};
	if (sliced.table.length > 0)
	{
		newA.table[right] = sliced;
		newA.lengths[right] = length(sliced) + (right > 0 ? newA.lengths[right - 1] : 0);
	}
	return newA;
}

function sliceLeft(from, a)
{
	if (from === 0)
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(from, a.table.length + 1);
		return newA;
	}

	// Slice the left recursively.
	var left = getSlot(from, a);
	var sliced = sliceLeft(from - (left > 0 ? a.lengths[left - 1] : 0), a.table[left]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (left === a.table.length - 1)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(left, a.table.length + 1),
		lengths: new Array(a.table.length - left)
	};
	newA.table[0] = sliced;
	var len = 0;
	for (var i = 0; i < newA.table.length; i++)
	{
		len += length(newA.table[i]);
		newA.lengths[i] = len;
	}

	return newA;
}

// Appends two trees.
function append(a,b)
{
	if (a.table.length === 0)
	{
		return b;
	}
	if (b.table.length === 0)
	{
		return a;
	}

	var c = append_(a, b);

	// Check if both nodes can be crunshed together.
	if (c[0].table.length + c[1].table.length <= M)
	{
		if (c[0].table.length === 0)
		{
			return c[1];
		}
		if (c[1].table.length === 0)
		{
			return c[0];
		}

		// Adjust .table and .lengths
		c[0].table = c[0].table.concat(c[1].table);
		if (c[0].height > 0)
		{
			var len = length(c[0]);
			for (var i = 0; i < c[1].lengths.length; i++)
			{
				c[1].lengths[i] += len;
			}
			c[0].lengths = c[0].lengths.concat(c[1].lengths);
		}

		return c[0];
	}

	if (c[0].height > 0)
	{
		var toRemove = calcToRemove(a, b);
		if (toRemove > E)
		{
			c = shuffle(c[0], c[1], toRemove);
		}
	}

	return siblise(c[0], c[1]);
}

// Returns an array of two nodes; right and left. One node _may_ be empty.
function append_(a, b)
{
	if (a.height === 0 && b.height === 0)
	{
		return [a, b];
	}

	if (a.height !== 1 || b.height !== 1)
	{
		if (a.height === b.height)
		{
			a = nodeCopy(a);
			b = nodeCopy(b);
			var appended = append_(botRight(a), botLeft(b));

			insertRight(a, appended[1]);
			insertLeft(b, appended[0]);
		}
		else if (a.height > b.height)
		{
			a = nodeCopy(a);
			var appended = append_(botRight(a), b);

			insertRight(a, appended[0]);
			b = parentise(appended[1], appended[1].height + 1);
		}
		else
		{
			b = nodeCopy(b);
			var appended = append_(a, botLeft(b));

			var left = appended[0].table.length === 0 ? 0 : 1;
			var right = left === 0 ? 1 : 0;
			insertLeft(b, appended[left]);
			a = parentise(appended[right], appended[right].height + 1);
		}
	}

	// Check if balancing is needed and return based on that.
	if (a.table.length === 0 || b.table.length === 0)
	{
		return [a, b];
	}

	var toRemove = calcToRemove(a, b);
	if (toRemove <= E)
	{
		return [a, b];
	}
	return shuffle(a, b, toRemove);
}

// Helperfunctions for append_. Replaces a child node at the side of the parent.
function insertRight(parent, node)
{
	var index = parent.table.length - 1;
	parent.table[index] = node;
	parent.lengths[index] = length(node);
	parent.lengths[index] += index > 0 ? parent.lengths[index - 1] : 0;
}

function insertLeft(parent, node)
{
	if (node.table.length > 0)
	{
		parent.table[0] = node;
		parent.lengths[0] = length(node);

		var len = length(parent.table[0]);
		for (var i = 1; i < parent.lengths.length; i++)
		{
			len += length(parent.table[i]);
			parent.lengths[i] = len;
		}
	}
	else
	{
		parent.table.shift();
		for (var i = 1; i < parent.lengths.length; i++)
		{
			parent.lengths[i] = parent.lengths[i] - parent.lengths[0];
		}
		parent.lengths.shift();
	}
}

// Returns the extra search steps for E. Refer to the paper.
function calcToRemove(a, b)
{
	var subLengths = 0;
	for (var i = 0; i < a.table.length; i++)
	{
		subLengths += a.table[i].table.length;
	}
	for (var i = 0; i < b.table.length; i++)
	{
		subLengths += b.table[i].table.length;
	}

	var toRemove = a.table.length + b.table.length;
	return toRemove - (Math.floor((subLengths - 1) / M) + 1);
}

// get2, set2 and saveSlot are helpers for accessing elements over two arrays.
function get2(a, b, index)
{
	return index < a.length
		? a[index]
		: b[index - a.length];
}

function set2(a, b, index, value)
{
	if (index < a.length)
	{
		a[index] = value;
	}
	else
	{
		b[index - a.length] = value;
	}
}

function saveSlot(a, b, index, slot)
{
	set2(a.table, b.table, index, slot);

	var l = (index === 0 || index === a.lengths.length)
		? 0
		: get2(a.lengths, a.lengths, index - 1);

	set2(a.lengths, b.lengths, index, l + length(slot));
}

// Creates a node or leaf with a given length at their arrays for perfomance.
// Is only used by shuffle.
function createNode(h, length)
{
	if (length < 0)
	{
		length = 0;
	}
	var a = {
		ctor: '_Array',
		height: h,
		table: new Array(length)
	};
	if (h > 0)
	{
		a.lengths = new Array(length);
	}
	return a;
}

// Returns an array of two balanced nodes.
function shuffle(a, b, toRemove)
{
	var newA = createNode(a.height, Math.min(M, a.table.length + b.table.length - toRemove));
	var newB = createNode(a.height, newA.table.length - (a.table.length + b.table.length - toRemove));

	// Skip the slots with size M. More precise: copy the slot references
	// to the new node
	var read = 0;
	while (get2(a.table, b.table, read).table.length % M === 0)
	{
		set2(newA.table, newB.table, read, get2(a.table, b.table, read));
		set2(newA.lengths, newB.lengths, read, get2(a.lengths, b.lengths, read));
		read++;
	}

	// Pulling items from left to right, caching in a slot before writing
	// it into the new nodes.
	var write = read;
	var slot = new createNode(a.height - 1, 0);
	var from = 0;

	// If the current slot is still containing data, then there will be at
	// least one more write, so we do not break this loop yet.
	while (read - write - (slot.table.length > 0 ? 1 : 0) < toRemove)
	{
		// Find out the max possible items for copying.
		var source = get2(a.table, b.table, read);
		var to = Math.min(M - slot.table.length, source.table.length);

		// Copy and adjust size table.
		slot.table = slot.table.concat(source.table.slice(from, to));
		if (slot.height > 0)
		{
			var len = slot.lengths.length;
			for (var i = len; i < len + to - from; i++)
			{
				slot.lengths[i] = length(slot.table[i]);
				slot.lengths[i] += (i > 0 ? slot.lengths[i - 1] : 0);
			}
		}

		from += to;

		// Only proceed to next slots[i] if the current one was
		// fully copied.
		if (source.table.length <= to)
		{
			read++; from = 0;
		}

		// Only create a new slot if the current one is filled up.
		if (slot.table.length === M)
		{
			saveSlot(newA, newB, write, slot);
			slot = createNode(a.height - 1, 0);
			write++;
		}
	}

	// Cleanup after the loop. Copy the last slot into the new nodes.
	if (slot.table.length > 0)
	{
		saveSlot(newA, newB, write, slot);
		write++;
	}

	// Shift the untouched slots to the left
	while (read < a.table.length + b.table.length )
	{
		saveSlot(newA, newB, write, get2(a.table, b.table, read));
		read++;
		write++;
	}

	return [newA, newB];
}

// Navigation functions
function botRight(a)
{
	return a.table[a.table.length - 1];
}
function botLeft(a)
{
	return a.table[0];
}

// Copies a node for updating. Note that you should not use this if
// only updating only one of "table" or "lengths" for performance reasons.
function nodeCopy(a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice()
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths.slice();
	}
	return newA;
}

// Returns how many items are in the tree.
function length(array)
{
	if (array.height === 0)
	{
		return array.table.length;
	}
	else
	{
		return array.lengths[array.lengths.length - 1];
	}
}

// Calculates in which slot of "table" the item probably is, then
// find the exact slot via forward searching in  "lengths". Returns the index.
function getSlot(i, a)
{
	var slot = i >> (5 * a.height);
	while (a.lengths[slot] <= i)
	{
		slot++;
	}
	return slot;
}

// Recursively creates a tree with a given height containing
// only the given item.
function create(item, h)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: [item]
		};
	}
	return {
		ctor: '_Array',
		height: h,
		table: [create(item, h - 1)],
		lengths: [1]
	};
}

// Recursively creates a tree that contains the given tree.
function parentise(tree, h)
{
	if (h === tree.height)
	{
		return tree;
	}

	return {
		ctor: '_Array',
		height: h,
		table: [parentise(tree, h - 1)],
		lengths: [length(tree)]
	};
}

// Emphasizes blood brotherhood beneath two trees.
function siblise(a, b)
{
	return {
		ctor: '_Array',
		height: a.height + 1,
		table: [a, b],
		lengths: [length(a), length(a) + length(b)]
	};
}

function toJSArray(a)
{
	var jsArray = new Array(length(a));
	toJSArray_(jsArray, 0, a);
	return jsArray;
}

function toJSArray_(jsArray, i, a)
{
	for (var t = 0; t < a.table.length; t++)
	{
		if (a.height === 0)
		{
			jsArray[i + t] = a.table[t];
		}
		else
		{
			var inc = t === 0 ? 0 : a.lengths[t - 1];
			toJSArray_(jsArray, i + inc, a.table[t]);
		}
	}
}

function fromJSArray(jsArray)
{
	if (jsArray.length === 0)
	{
		return empty;
	}
	var h = Math.floor(Math.log(jsArray.length) / Math.log(M));
	return fromJSArray_(jsArray, h, 0, jsArray.length);
}

function fromJSArray_(jsArray, h, from, to)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: jsArray.slice(from, to)
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = fromJSArray_(jsArray, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i - 1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

return {
	empty: empty,
	fromList: fromList,
	toList: toList,
	initialize: F2(initialize),
	append: F2(append),
	push: F2(push),
	slice: F3(slice),
	get: F2(get),
	set: F3(set),
	map: F2(map),
	indexedMap: F2(indexedMap),
	foldl: F3(foldl),
	foldr: F3(foldr),
	length: length,

	toJSArray: toJSArray,
	fromJSArray: fromJSArray
};

}();
//import Native.Utils //

var _elm_lang$core$Native_Basics = function() {

function div(a, b)
{
	return (a / b) | 0;
}
function rem(a, b)
{
	return a % b;
}
function mod(a, b)
{
	if (b === 0)
	{
		throw new Error('Cannot perform mod 0. Division by zero error.');
	}
	var r = a % b;
	var m = a === 0 ? 0 : (b > 0 ? (a >= 0 ? r : r + b) : -mod(-a, -b));

	return m === b ? 0 : m;
}
function logBase(base, n)
{
	return Math.log(n) / Math.log(base);
}
function negate(n)
{
	return -n;
}
function abs(n)
{
	return n < 0 ? -n : n;
}

function min(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) < 0 ? a : b;
}
function max(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) > 0 ? a : b;
}
function clamp(lo, hi, n)
{
	return _elm_lang$core$Native_Utils.cmp(n, lo) < 0
		? lo
		: _elm_lang$core$Native_Utils.cmp(n, hi) > 0
			? hi
			: n;
}

var ord = ['LT', 'EQ', 'GT'];

function compare(x, y)
{
	return { ctor: ord[_elm_lang$core$Native_Utils.cmp(x, y) + 1] };
}

function xor(a, b)
{
	return a !== b;
}
function not(b)
{
	return !b;
}
function isInfinite(n)
{
	return n === Infinity || n === -Infinity;
}

function truncate(n)
{
	return n | 0;
}

function degrees(d)
{
	return d * Math.PI / 180;
}
function turns(t)
{
	return 2 * Math.PI * t;
}
function fromPolar(point)
{
	var r = point._0;
	var t = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(r * Math.cos(t), r * Math.sin(t));
}
function toPolar(point)
{
	var x = point._0;
	var y = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(Math.sqrt(x * x + y * y), Math.atan2(y, x));
}

return {
	div: F2(div),
	rem: F2(rem),
	mod: F2(mod),

	pi: Math.PI,
	e: Math.E,
	cos: Math.cos,
	sin: Math.sin,
	tan: Math.tan,
	acos: Math.acos,
	asin: Math.asin,
	atan: Math.atan,
	atan2: F2(Math.atan2),

	degrees: degrees,
	turns: turns,
	fromPolar: fromPolar,
	toPolar: toPolar,

	sqrt: Math.sqrt,
	logBase: F2(logBase),
	negate: negate,
	abs: abs,
	min: F2(min),
	max: F2(max),
	clamp: F3(clamp),
	compare: F2(compare),

	xor: F2(xor),
	not: not,

	truncate: truncate,
	ceiling: Math.ceil,
	floor: Math.floor,
	round: Math.round,
	toFloat: function(x) { return x; },
	isNaN: isNaN,
	isInfinite: isInfinite
};

}();
//import //

var _elm_lang$core$Native_Utils = function() {

// COMPARISONS

function eq(x, y)
{
	var stack = [];
	var isEqual = eqHelp(x, y, 0, stack);
	var pair;
	while (isEqual && (pair = stack.pop()))
	{
		isEqual = eqHelp(pair.x, pair.y, 0, stack);
	}
	return isEqual;
}


function eqHelp(x, y, depth, stack)
{
	if (depth > 100)
	{
		stack.push({ x: x, y: y });
		return true;
	}

	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object')
	{
		if (typeof x === 'function')
		{
			throw new Error(
				'Trying to use `(==)` on functions. There is no way to know if functions are "the same" in the Elm sense.'
				+ ' Read more about this at http://package.elm-lang.org/packages/elm-lang/core/latest/Basics#=='
				+ ' which describes why it is this way and what the better version will look like.'
			);
		}
		return false;
	}

	if (x === null || y === null)
	{
		return false
	}

	if (x instanceof Date)
	{
		return x.getTime() === y.getTime();
	}

	if (!('ctor' in x))
	{
		for (var key in x)
		{
			if (!eqHelp(x[key], y[key], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	// convert Dicts and Sets to lists
	if (x.ctor === 'RBNode_elm_builtin' || x.ctor === 'RBEmpty_elm_builtin')
	{
		x = _elm_lang$core$Dict$toList(x);
		y = _elm_lang$core$Dict$toList(y);
	}
	if (x.ctor === 'Set_elm_builtin')
	{
		x = _elm_lang$core$Set$toList(x);
		y = _elm_lang$core$Set$toList(y);
	}

	// check if lists are equal without recursion
	if (x.ctor === '::')
	{
		var a = x;
		var b = y;
		while (a.ctor === '::' && b.ctor === '::')
		{
			if (!eqHelp(a._0, b._0, depth + 1, stack))
			{
				return false;
			}
			a = a._1;
			b = b._1;
		}
		return a.ctor === b.ctor;
	}

	// check if Arrays are equal
	if (x.ctor === '_Array')
	{
		var xs = _elm_lang$core$Native_Array.toJSArray(x);
		var ys = _elm_lang$core$Native_Array.toJSArray(y);
		if (xs.length !== ys.length)
		{
			return false;
		}
		for (var i = 0; i < xs.length; i++)
		{
			if (!eqHelp(xs[i], ys[i], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	if (!eqHelp(x.ctor, y.ctor, depth + 1, stack))
	{
		return false;
	}

	for (var key in x)
	{
		if (!eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

var LT = -1, EQ = 0, GT = 1;

function cmp(x, y)
{
	if (typeof x !== 'object')
	{
		return x === y ? EQ : x < y ? LT : GT;
	}

	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? EQ : a < b ? LT : GT;
	}

	if (x.ctor === '::' || x.ctor === '[]')
	{
		while (x.ctor === '::' && y.ctor === '::')
		{
			var ord = cmp(x._0, y._0);
			if (ord !== EQ)
			{
				return ord;
			}
			x = x._1;
			y = y._1;
		}
		return x.ctor === y.ctor ? EQ : x.ctor === '[]' ? LT : GT;
	}

	if (x.ctor.slice(0, 6) === '_Tuple')
	{
		var ord;
		var n = x.ctor.slice(6) - 0;
		var err = 'cannot compare tuples with more than 6 elements.';
		if (n === 0) return EQ;
		if (n >= 1) { ord = cmp(x._0, y._0); if (ord !== EQ) return ord;
		if (n >= 2) { ord = cmp(x._1, y._1); if (ord !== EQ) return ord;
		if (n >= 3) { ord = cmp(x._2, y._2); if (ord !== EQ) return ord;
		if (n >= 4) { ord = cmp(x._3, y._3); if (ord !== EQ) return ord;
		if (n >= 5) { ord = cmp(x._4, y._4); if (ord !== EQ) return ord;
		if (n >= 6) { ord = cmp(x._5, y._5); if (ord !== EQ) return ord;
		if (n >= 7) throw new Error('Comparison error: ' + err); } } } } } }
		return EQ;
	}

	throw new Error(
		'Comparison error: comparison is only defined on ints, '
		+ 'floats, times, chars, strings, lists of comparable values, '
		+ 'and tuples of comparable values.'
	);
}


// COMMON VALUES

var Tuple0 = {
	ctor: '_Tuple0'
};

function Tuple2(x, y)
{
	return {
		ctor: '_Tuple2',
		_0: x,
		_1: y
	};
}

function chr(c)
{
	return new String(c);
}


// GUID

var count = 0;
function guid(_)
{
	return count++;
}


// RECORDS

function update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


//// LIST STUFF ////

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return {
		ctor: '::',
		_0: hd,
		_1: tl
	};
}

function append(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (xs.ctor === '[]')
	{
		return ys;
	}
	var root = Cons(xs._0, Nil);
	var curr = root;
	xs = xs._1;
	while (xs.ctor !== '[]')
	{
		curr._1 = Cons(xs._0, Nil);
		xs = xs._1;
		curr = curr._1;
	}
	curr._1 = ys;
	return root;
}


// CRASHES

function crash(moduleName, region)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '` ' + regionToString(region) + '\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function crashCase(moduleName, region, value)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '`\n\n'
			+ 'This was caused by the `case` expression ' + regionToString(region) + '.\n'
			+ 'One of the branches ended with a crash and the following value got through:\n\n    ' + toString(value) + '\n\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function regionToString(region)
{
	if (region.start.line == region.end.line)
	{
		return 'on line ' + region.start.line;
	}
	return 'between lines ' + region.start.line + ' and ' + region.end.line;
}


// TO STRING

function toString(v)
{
	var type = typeof v;
	if (type === 'function')
	{
		return '<function>';
	}

	if (type === 'boolean')
	{
		return v ? 'True' : 'False';
	}

	if (type === 'number')
	{
		return v + '';
	}

	if (v instanceof String)
	{
		return '\'' + addSlashes(v, true) + '\'';
	}

	if (type === 'string')
	{
		return '"' + addSlashes(v, false) + '"';
	}

	if (v === null)
	{
		return 'null';
	}

	if (type === 'object' && 'ctor' in v)
	{
		var ctorStarter = v.ctor.substring(0, 5);

		if (ctorStarter === '_Tupl')
		{
			var output = [];
			for (var k in v)
			{
				if (k === 'ctor') continue;
				output.push(toString(v[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (ctorStarter === '_Task')
		{
			return '<task>'
		}

		if (v.ctor === '_Array')
		{
			var list = _elm_lang$core$Array$toList(v);
			return 'Array.fromList ' + toString(list);
		}

		if (v.ctor === '<decoder>')
		{
			return '<decoder>';
		}

		if (v.ctor === '_Process')
		{
			return '<process:' + v.id + '>';
		}

		if (v.ctor === '::')
		{
			var output = '[' + toString(v._0);
			v = v._1;
			while (v.ctor === '::')
			{
				output += ',' + toString(v._0);
				v = v._1;
			}
			return output + ']';
		}

		if (v.ctor === '[]')
		{
			return '[]';
		}

		if (v.ctor === 'Set_elm_builtin')
		{
			return 'Set.fromList ' + toString(_elm_lang$core$Set$toList(v));
		}

		if (v.ctor === 'RBNode_elm_builtin' || v.ctor === 'RBEmpty_elm_builtin')
		{
			return 'Dict.fromList ' + toString(_elm_lang$core$Dict$toList(v));
		}

		var output = '';
		for (var i in v)
		{
			if (i === 'ctor') continue;
			var str = toString(v[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return v.ctor + output;
	}

	if (type === 'object')
	{
		if (v instanceof Date)
		{
			return '<' + v.toString() + '>';
		}

		if (v.elm_web_socket)
		{
			return '<websocket>';
		}

		var output = [];
		for (var k in v)
		{
			output.push(k + ' = ' + toString(v[k]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return '<internal structure>';
}

function addSlashes(str, isChar)
{
	var s = str.replace(/\\/g, '\\\\')
			  .replace(/\n/g, '\\n')
			  .replace(/\t/g, '\\t')
			  .replace(/\r/g, '\\r')
			  .replace(/\v/g, '\\v')
			  .replace(/\0/g, '\\0');
	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}


return {
	eq: eq,
	cmp: cmp,
	Tuple0: Tuple0,
	Tuple2: Tuple2,
	chr: chr,
	update: update,
	guid: guid,

	append: F2(append),

	crash: crash,
	crashCase: crashCase,

	toString: toString
};

}();
var _elm_lang$core$Basics$never = function (_p0) {
	never:
	while (true) {
		var _p1 = _p0;
		var _v1 = _p1._0;
		_p0 = _v1;
		continue never;
	}
};
var _elm_lang$core$Basics$uncurry = F2(
	function (f, _p2) {
		var _p3 = _p2;
		return A2(f, _p3._0, _p3._1);
	});
var _elm_lang$core$Basics$curry = F3(
	function (f, a, b) {
		return f(
			{ctor: '_Tuple2', _0: a, _1: b});
	});
var _elm_lang$core$Basics$flip = F3(
	function (f, b, a) {
		return A2(f, a, b);
	});
var _elm_lang$core$Basics$always = F2(
	function (a, _p4) {
		return a;
	});
var _elm_lang$core$Basics$identity = function (x) {
	return x;
};
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<|'] = F2(
	function (f, x) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['|>'] = F2(
	function (x, f) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>>'] = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<<'] = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['++'] = _elm_lang$core$Native_Utils.append;
var _elm_lang$core$Basics$toString = _elm_lang$core$Native_Utils.toString;
var _elm_lang$core$Basics$isInfinite = _elm_lang$core$Native_Basics.isInfinite;
var _elm_lang$core$Basics$isNaN = _elm_lang$core$Native_Basics.isNaN;
var _elm_lang$core$Basics$toFloat = _elm_lang$core$Native_Basics.toFloat;
var _elm_lang$core$Basics$ceiling = _elm_lang$core$Native_Basics.ceiling;
var _elm_lang$core$Basics$floor = _elm_lang$core$Native_Basics.floor;
var _elm_lang$core$Basics$truncate = _elm_lang$core$Native_Basics.truncate;
var _elm_lang$core$Basics$round = _elm_lang$core$Native_Basics.round;
var _elm_lang$core$Basics$not = _elm_lang$core$Native_Basics.not;
var _elm_lang$core$Basics$xor = _elm_lang$core$Native_Basics.xor;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['||'] = _elm_lang$core$Native_Basics.or;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['&&'] = _elm_lang$core$Native_Basics.and;
var _elm_lang$core$Basics$max = _elm_lang$core$Native_Basics.max;
var _elm_lang$core$Basics$min = _elm_lang$core$Native_Basics.min;
var _elm_lang$core$Basics$compare = _elm_lang$core$Native_Basics.compare;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>='] = _elm_lang$core$Native_Basics.ge;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<='] = _elm_lang$core$Native_Basics.le;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>'] = _elm_lang$core$Native_Basics.gt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<'] = _elm_lang$core$Native_Basics.lt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/='] = _elm_lang$core$Native_Basics.neq;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['=='] = _elm_lang$core$Native_Basics.eq;
var _elm_lang$core$Basics$e = _elm_lang$core$Native_Basics.e;
var _elm_lang$core$Basics$pi = _elm_lang$core$Native_Basics.pi;
var _elm_lang$core$Basics$clamp = _elm_lang$core$Native_Basics.clamp;
var _elm_lang$core$Basics$logBase = _elm_lang$core$Native_Basics.logBase;
var _elm_lang$core$Basics$abs = _elm_lang$core$Native_Basics.abs;
var _elm_lang$core$Basics$negate = _elm_lang$core$Native_Basics.negate;
var _elm_lang$core$Basics$sqrt = _elm_lang$core$Native_Basics.sqrt;
var _elm_lang$core$Basics$atan2 = _elm_lang$core$Native_Basics.atan2;
var _elm_lang$core$Basics$atan = _elm_lang$core$Native_Basics.atan;
var _elm_lang$core$Basics$asin = _elm_lang$core$Native_Basics.asin;
var _elm_lang$core$Basics$acos = _elm_lang$core$Native_Basics.acos;
var _elm_lang$core$Basics$tan = _elm_lang$core$Native_Basics.tan;
var _elm_lang$core$Basics$sin = _elm_lang$core$Native_Basics.sin;
var _elm_lang$core$Basics$cos = _elm_lang$core$Native_Basics.cos;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['^'] = _elm_lang$core$Native_Basics.exp;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['%'] = _elm_lang$core$Native_Basics.mod;
var _elm_lang$core$Basics$rem = _elm_lang$core$Native_Basics.rem;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['//'] = _elm_lang$core$Native_Basics.div;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/'] = _elm_lang$core$Native_Basics.floatDiv;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['*'] = _elm_lang$core$Native_Basics.mul;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['-'] = _elm_lang$core$Native_Basics.sub;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['+'] = _elm_lang$core$Native_Basics.add;
var _elm_lang$core$Basics$toPolar = _elm_lang$core$Native_Basics.toPolar;
var _elm_lang$core$Basics$fromPolar = _elm_lang$core$Native_Basics.fromPolar;
var _elm_lang$core$Basics$turns = _elm_lang$core$Native_Basics.turns;
var _elm_lang$core$Basics$degrees = _elm_lang$core$Native_Basics.degrees;
var _elm_lang$core$Basics$radians = function (t) {
	return t;
};
var _elm_lang$core$Basics$GT = {ctor: 'GT'};
var _elm_lang$core$Basics$EQ = {ctor: 'EQ'};
var _elm_lang$core$Basics$LT = {ctor: 'LT'};
var _elm_lang$core$Basics$JustOneMore = function (a) {
	return {ctor: 'JustOneMore', _0: a};
};

var _elm_lang$core$Maybe$withDefault = F2(
	function ($default, maybe) {
		var _p0 = maybe;
		if (_p0.ctor === 'Just') {
			return _p0._0;
		} else {
			return $default;
		}
	});
var _elm_lang$core$Maybe$Nothing = {ctor: 'Nothing'};
var _elm_lang$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		var _p1 = maybeValue;
		if (_p1.ctor === 'Just') {
			return callback(_p1._0);
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$Just = function (a) {
	return {ctor: 'Just', _0: a};
};
var _elm_lang$core$Maybe$map = F2(
	function (f, maybe) {
		var _p2 = maybe;
		if (_p2.ctor === 'Just') {
			return _elm_lang$core$Maybe$Just(
				f(_p2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map2 = F3(
	function (func, ma, mb) {
		var _p3 = {ctor: '_Tuple2', _0: ma, _1: mb};
		if (((_p3.ctor === '_Tuple2') && (_p3._0.ctor === 'Just')) && (_p3._1.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A2(func, _p3._0._0, _p3._1._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map3 = F4(
	function (func, ma, mb, mc) {
		var _p4 = {ctor: '_Tuple3', _0: ma, _1: mb, _2: mc};
		if ((((_p4.ctor === '_Tuple3') && (_p4._0.ctor === 'Just')) && (_p4._1.ctor === 'Just')) && (_p4._2.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A3(func, _p4._0._0, _p4._1._0, _p4._2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map4 = F5(
	function (func, ma, mb, mc, md) {
		var _p5 = {ctor: '_Tuple4', _0: ma, _1: mb, _2: mc, _3: md};
		if (((((_p5.ctor === '_Tuple4') && (_p5._0.ctor === 'Just')) && (_p5._1.ctor === 'Just')) && (_p5._2.ctor === 'Just')) && (_p5._3.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A4(func, _p5._0._0, _p5._1._0, _p5._2._0, _p5._3._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map5 = F6(
	function (func, ma, mb, mc, md, me) {
		var _p6 = {ctor: '_Tuple5', _0: ma, _1: mb, _2: mc, _3: md, _4: me};
		if ((((((_p6.ctor === '_Tuple5') && (_p6._0.ctor === 'Just')) && (_p6._1.ctor === 'Just')) && (_p6._2.ctor === 'Just')) && (_p6._3.ctor === 'Just')) && (_p6._4.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A5(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0, _p6._4._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});

//import Native.Utils //

var _elm_lang$core$Native_List = function() {

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return { ctor: '::', _0: hd, _1: tl };
}

function fromArray(arr)
{
	var out = Nil;
	for (var i = arr.length; i--; )
	{
		out = Cons(arr[i], out);
	}
	return out;
}

function toArray(xs)
{
	var out = [];
	while (xs.ctor !== '[]')
	{
		out.push(xs._0);
		xs = xs._1;
	}
	return out;
}

function foldr(f, b, xs)
{
	var arr = toArray(xs);
	var acc = b;
	for (var i = arr.length; i--; )
	{
		acc = A2(f, arr[i], acc);
	}
	return acc;
}

function map2(f, xs, ys)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]')
	{
		arr.push(A2(f, xs._0, ys._0));
		xs = xs._1;
		ys = ys._1;
	}
	return fromArray(arr);
}

function map3(f, xs, ys, zs)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]' && zs.ctor !== '[]')
	{
		arr.push(A3(f, xs._0, ys._0, zs._0));
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map4(f, ws, xs, ys, zs)
{
	var arr = [];
	while (   ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A4(f, ws._0, xs._0, ys._0, zs._0));
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map5(f, vs, ws, xs, ys, zs)
{
	var arr = [];
	while (   vs.ctor !== '[]'
		   && ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A5(f, vs._0, ws._0, xs._0, ys._0, zs._0));
		vs = vs._1;
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function sortBy(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		return _elm_lang$core$Native_Utils.cmp(f(a), f(b));
	}));
}

function sortWith(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		var ord = f(a)(b).ctor;
		return ord === 'EQ' ? 0 : ord === 'LT' ? -1 : 1;
	}));
}

return {
	Nil: Nil,
	Cons: Cons,
	cons: F2(Cons),
	toArray: toArray,
	fromArray: fromArray,

	foldr: F3(foldr),

	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	sortBy: F2(sortBy),
	sortWith: F2(sortWith)
};

}();
var _elm_lang$core$List$sortWith = _elm_lang$core$Native_List.sortWith;
var _elm_lang$core$List$sortBy = _elm_lang$core$Native_List.sortBy;
var _elm_lang$core$List$sort = function (xs) {
	return A2(_elm_lang$core$List$sortBy, _elm_lang$core$Basics$identity, xs);
};
var _elm_lang$core$List$singleton = function (value) {
	return {
		ctor: '::',
		_0: value,
		_1: {ctor: '[]'}
	};
};
var _elm_lang$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return list;
			} else {
				var _p0 = list;
				if (_p0.ctor === '[]') {
					return list;
				} else {
					var _v1 = n - 1,
						_v2 = _p0._1;
					n = _v1;
					list = _v2;
					continue drop;
				}
			}
		}
	});
var _elm_lang$core$List$map5 = _elm_lang$core$Native_List.map5;
var _elm_lang$core$List$map4 = _elm_lang$core$Native_List.map4;
var _elm_lang$core$List$map3 = _elm_lang$core$Native_List.map3;
var _elm_lang$core$List$map2 = _elm_lang$core$Native_List.map2;
var _elm_lang$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			var _p1 = list;
			if (_p1.ctor === '[]') {
				return false;
			} else {
				if (isOkay(_p1._0)) {
					return true;
				} else {
					var _v4 = isOkay,
						_v5 = _p1._1;
					isOkay = _v4;
					list = _v5;
					continue any;
				}
			}
		}
	});
var _elm_lang$core$List$all = F2(
	function (isOkay, list) {
		return !A2(
			_elm_lang$core$List$any,
			function (_p2) {
				return !isOkay(_p2);
			},
			list);
	});
var _elm_lang$core$List$foldr = _elm_lang$core$Native_List.foldr;
var _elm_lang$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			var _p3 = list;
			if (_p3.ctor === '[]') {
				return acc;
			} else {
				var _v7 = func,
					_v8 = A2(func, _p3._0, acc),
					_v9 = _p3._1;
				func = _v7;
				acc = _v8;
				list = _v9;
				continue foldl;
			}
		}
	});
var _elm_lang$core$List$length = function (xs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p4, i) {
				return i + 1;
			}),
		0,
		xs);
};
var _elm_lang$core$List$sum = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x + y;
			}),
		0,
		numbers);
};
var _elm_lang$core$List$product = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x * y;
			}),
		1,
		numbers);
};
var _elm_lang$core$List$maximum = function (list) {
	var _p5 = list;
	if (_p5.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$max, _p5._0, _p5._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$minimum = function (list) {
	var _p6 = list;
	if (_p6.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$min, _p6._0, _p6._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$member = F2(
	function (x, xs) {
		return A2(
			_elm_lang$core$List$any,
			function (a) {
				return _elm_lang$core$Native_Utils.eq(a, x);
			},
			xs);
	});
var _elm_lang$core$List$isEmpty = function (xs) {
	var _p7 = xs;
	if (_p7.ctor === '[]') {
		return true;
	} else {
		return false;
	}
};
var _elm_lang$core$List$tail = function (list) {
	var _p8 = list;
	if (_p8.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p8._1);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$head = function (list) {
	var _p9 = list;
	if (_p9.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p9._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List_ops = _elm_lang$core$List_ops || {};
_elm_lang$core$List_ops['::'] = _elm_lang$core$Native_List.cons;
var _elm_lang$core$List$map = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			F2(
				function (x, acc) {
					return {
						ctor: '::',
						_0: f(x),
						_1: acc
					};
				}),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$filter = F2(
	function (pred, xs) {
		var conditionalCons = F2(
			function (front, back) {
				return pred(front) ? {ctor: '::', _0: front, _1: back} : back;
			});
		return A3(
			_elm_lang$core$List$foldr,
			conditionalCons,
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _p10 = f(mx);
		if (_p10.ctor === 'Just') {
			return {ctor: '::', _0: _p10._0, _1: xs};
		} else {
			return xs;
		}
	});
var _elm_lang$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			_elm_lang$core$List$maybeCons(f),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$reverse = function (list) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return {ctor: '::', _0: x, _1: y};
			}),
		{ctor: '[]'},
		list);
};
var _elm_lang$core$List$scanl = F3(
	function (f, b, xs) {
		var scan1 = F2(
			function (x, accAcc) {
				var _p11 = accAcc;
				if (_p11.ctor === '::') {
					return {
						ctor: '::',
						_0: A2(f, x, _p11._0),
						_1: accAcc
					};
				} else {
					return {ctor: '[]'};
				}
			});
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$foldl,
				scan1,
				{
					ctor: '::',
					_0: b,
					_1: {ctor: '[]'}
				},
				xs));
	});
var _elm_lang$core$List$append = F2(
	function (xs, ys) {
		var _p12 = ys;
		if (_p12.ctor === '[]') {
			return xs;
		} else {
			return A3(
				_elm_lang$core$List$foldr,
				F2(
					function (x, y) {
						return {ctor: '::', _0: x, _1: y};
					}),
				ys,
				xs);
		}
	});
var _elm_lang$core$List$concat = function (lists) {
	return A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$List$append,
		{ctor: '[]'},
		lists);
};
var _elm_lang$core$List$concatMap = F2(
	function (f, list) {
		return _elm_lang$core$List$concat(
			A2(_elm_lang$core$List$map, f, list));
	});
var _elm_lang$core$List$partition = F2(
	function (pred, list) {
		var step = F2(
			function (x, _p13) {
				var _p14 = _p13;
				var _p16 = _p14._0;
				var _p15 = _p14._1;
				return pred(x) ? {
					ctor: '_Tuple2',
					_0: {ctor: '::', _0: x, _1: _p16},
					_1: _p15
				} : {
					ctor: '_Tuple2',
					_0: _p16,
					_1: {ctor: '::', _0: x, _1: _p15}
				};
			});
		return A3(
			_elm_lang$core$List$foldr,
			step,
			{
				ctor: '_Tuple2',
				_0: {ctor: '[]'},
				_1: {ctor: '[]'}
			},
			list);
	});
var _elm_lang$core$List$unzip = function (pairs) {
	var step = F2(
		function (_p18, _p17) {
			var _p19 = _p18;
			var _p20 = _p17;
			return {
				ctor: '_Tuple2',
				_0: {ctor: '::', _0: _p19._0, _1: _p20._0},
				_1: {ctor: '::', _0: _p19._1, _1: _p20._1}
			};
		});
	return A3(
		_elm_lang$core$List$foldr,
		step,
		{
			ctor: '_Tuple2',
			_0: {ctor: '[]'},
			_1: {ctor: '[]'}
		},
		pairs);
};
var _elm_lang$core$List$intersperse = F2(
	function (sep, xs) {
		var _p21 = xs;
		if (_p21.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			var step = F2(
				function (x, rest) {
					return {
						ctor: '::',
						_0: sep,
						_1: {ctor: '::', _0: x, _1: rest}
					};
				});
			var spersed = A3(
				_elm_lang$core$List$foldr,
				step,
				{ctor: '[]'},
				_p21._1);
			return {ctor: '::', _0: _p21._0, _1: spersed};
		}
	});
var _elm_lang$core$List$takeReverse = F3(
	function (n, list, taken) {
		takeReverse:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return taken;
			} else {
				var _p22 = list;
				if (_p22.ctor === '[]') {
					return taken;
				} else {
					var _v23 = n - 1,
						_v24 = _p22._1,
						_v25 = {ctor: '::', _0: _p22._0, _1: taken};
					n = _v23;
					list = _v24;
					taken = _v25;
					continue takeReverse;
				}
			}
		}
	});
var _elm_lang$core$List$takeTailRec = F2(
	function (n, list) {
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$takeReverse,
				n,
				list,
				{ctor: '[]'}));
	});
var _elm_lang$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
			return {ctor: '[]'};
		} else {
			var _p23 = {ctor: '_Tuple2', _0: n, _1: list};
			_v26_5:
			do {
				_v26_1:
				do {
					if (_p23.ctor === '_Tuple2') {
						if (_p23._1.ctor === '[]') {
							return list;
						} else {
							if (_p23._1._1.ctor === '::') {
								switch (_p23._0) {
									case 1:
										break _v26_1;
									case 2:
										return {
											ctor: '::',
											_0: _p23._1._0,
											_1: {
												ctor: '::',
												_0: _p23._1._1._0,
												_1: {ctor: '[]'}
											}
										};
									case 3:
										if (_p23._1._1._1.ctor === '::') {
											return {
												ctor: '::',
												_0: _p23._1._0,
												_1: {
													ctor: '::',
													_0: _p23._1._1._0,
													_1: {
														ctor: '::',
														_0: _p23._1._1._1._0,
														_1: {ctor: '[]'}
													}
												}
											};
										} else {
											break _v26_5;
										}
									default:
										if ((_p23._1._1._1.ctor === '::') && (_p23._1._1._1._1.ctor === '::')) {
											var _p28 = _p23._1._1._1._0;
											var _p27 = _p23._1._1._0;
											var _p26 = _p23._1._0;
											var _p25 = _p23._1._1._1._1._0;
											var _p24 = _p23._1._1._1._1._1;
											return (_elm_lang$core$Native_Utils.cmp(ctr, 1000) > 0) ? {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A2(_elm_lang$core$List$takeTailRec, n - 4, _p24)
														}
													}
												}
											} : {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A3(_elm_lang$core$List$takeFast, ctr + 1, n - 4, _p24)
														}
													}
												}
											};
										} else {
											break _v26_5;
										}
								}
							} else {
								if (_p23._0 === 1) {
									break _v26_1;
								} else {
									break _v26_5;
								}
							}
						}
					} else {
						break _v26_5;
					}
				} while(false);
				return {
					ctor: '::',
					_0: _p23._1._0,
					_1: {ctor: '[]'}
				};
			} while(false);
			return list;
		}
	});
var _elm_lang$core$List$take = F2(
	function (n, list) {
		return A3(_elm_lang$core$List$takeFast, 0, n, list);
	});
var _elm_lang$core$List$repeatHelp = F3(
	function (result, n, value) {
		repeatHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return result;
			} else {
				var _v27 = {ctor: '::', _0: value, _1: result},
					_v28 = n - 1,
					_v29 = value;
				result = _v27;
				n = _v28;
				value = _v29;
				continue repeatHelp;
			}
		}
	});
var _elm_lang$core$List$repeat = F2(
	function (n, value) {
		return A3(
			_elm_lang$core$List$repeatHelp,
			{ctor: '[]'},
			n,
			value);
	});
var _elm_lang$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(lo, hi) < 1) {
				var _v30 = lo,
					_v31 = hi - 1,
					_v32 = {ctor: '::', _0: hi, _1: list};
				lo = _v30;
				hi = _v31;
				list = _v32;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var _elm_lang$core$List$range = F2(
	function (lo, hi) {
		return A3(
			_elm_lang$core$List$rangeHelp,
			lo,
			hi,
			{ctor: '[]'});
	});
var _elm_lang$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$map2,
			f,
			A2(
				_elm_lang$core$List$range,
				0,
				_elm_lang$core$List$length(xs) - 1),
			xs);
	});

var _elm_lang$core$Array$append = _elm_lang$core$Native_Array.append;
var _elm_lang$core$Array$length = _elm_lang$core$Native_Array.length;
var _elm_lang$core$Array$isEmpty = function (array) {
	return _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$Array$length(array),
		0);
};
var _elm_lang$core$Array$slice = _elm_lang$core$Native_Array.slice;
var _elm_lang$core$Array$set = _elm_lang$core$Native_Array.set;
var _elm_lang$core$Array$get = F2(
	function (i, array) {
		return ((_elm_lang$core$Native_Utils.cmp(0, i) < 1) && (_elm_lang$core$Native_Utils.cmp(
			i,
			_elm_lang$core$Native_Array.length(array)) < 0)) ? _elm_lang$core$Maybe$Just(
			A2(_elm_lang$core$Native_Array.get, i, array)) : _elm_lang$core$Maybe$Nothing;
	});
var _elm_lang$core$Array$push = _elm_lang$core$Native_Array.push;
var _elm_lang$core$Array$empty = _elm_lang$core$Native_Array.empty;
var _elm_lang$core$Array$filter = F2(
	function (isOkay, arr) {
		var update = F2(
			function (x, xs) {
				return isOkay(x) ? A2(_elm_lang$core$Native_Array.push, x, xs) : xs;
			});
		return A3(_elm_lang$core$Native_Array.foldl, update, _elm_lang$core$Native_Array.empty, arr);
	});
var _elm_lang$core$Array$foldr = _elm_lang$core$Native_Array.foldr;
var _elm_lang$core$Array$foldl = _elm_lang$core$Native_Array.foldl;
var _elm_lang$core$Array$indexedMap = _elm_lang$core$Native_Array.indexedMap;
var _elm_lang$core$Array$map = _elm_lang$core$Native_Array.map;
var _elm_lang$core$Array$toIndexedList = function (array) {
	return A3(
		_elm_lang$core$List$map2,
		F2(
			function (v0, v1) {
				return {ctor: '_Tuple2', _0: v0, _1: v1};
			}),
		A2(
			_elm_lang$core$List$range,
			0,
			_elm_lang$core$Native_Array.length(array) - 1),
		_elm_lang$core$Native_Array.toList(array));
};
var _elm_lang$core$Array$toList = _elm_lang$core$Native_Array.toList;
var _elm_lang$core$Array$fromList = _elm_lang$core$Native_Array.fromList;
var _elm_lang$core$Array$initialize = _elm_lang$core$Native_Array.initialize;
var _elm_lang$core$Array$repeat = F2(
	function (n, e) {
		return A2(
			_elm_lang$core$Array$initialize,
			n,
			_elm_lang$core$Basics$always(e));
	});
var _elm_lang$core$Array$Array = {ctor: 'Array'};

//import Native.Utils //

var _elm_lang$core$Native_Debug = function() {

function log(tag, value)
{
	var msg = tag + ': ' + _elm_lang$core$Native_Utils.toString(value);
	var process = process || {};
	if (process.stdout)
	{
		process.stdout.write(msg);
	}
	else
	{
		console.log(msg);
	}
	return value;
}

function crash(message)
{
	throw new Error(message);
}

return {
	crash: crash,
	log: F2(log)
};

}();
//import Maybe, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_String = function() {

function isEmpty(str)
{
	return str.length === 0;
}
function cons(chr, str)
{
	return chr + str;
}
function uncons(str)
{
	var hd = str[0];
	if (hd)
	{
		return _elm_lang$core$Maybe$Just(_elm_lang$core$Native_Utils.Tuple2(_elm_lang$core$Native_Utils.chr(hd), str.slice(1)));
	}
	return _elm_lang$core$Maybe$Nothing;
}
function append(a, b)
{
	return a + b;
}
function concat(strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join('');
}
function length(str)
{
	return str.length;
}
function map(f, str)
{
	var out = str.split('');
	for (var i = out.length; i--; )
	{
		out[i] = f(_elm_lang$core$Native_Utils.chr(out[i]));
	}
	return out.join('');
}
function filter(pred, str)
{
	return str.split('').map(_elm_lang$core$Native_Utils.chr).filter(pred).join('');
}
function reverse(str)
{
	return str.split('').reverse().join('');
}
function foldl(f, b, str)
{
	var len = str.length;
	for (var i = 0; i < len; ++i)
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function foldr(f, b, str)
{
	for (var i = str.length; i--; )
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function split(sep, str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(sep));
}
function join(sep, strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join(sep);
}
function repeat(n, str)
{
	var result = '';
	while (n > 0)
	{
		if (n & 1)
		{
			result += str;
		}
		n >>= 1, str += str;
	}
	return result;
}
function slice(start, end, str)
{
	return str.slice(start, end);
}
function left(n, str)
{
	return n < 1 ? '' : str.slice(0, n);
}
function right(n, str)
{
	return n < 1 ? '' : str.slice(-n);
}
function dropLeft(n, str)
{
	return n < 1 ? str : str.slice(n);
}
function dropRight(n, str)
{
	return n < 1 ? str : str.slice(0, -n);
}
function pad(n, chr, str)
{
	var half = (n - str.length) / 2;
	return repeat(Math.ceil(half), chr) + str + repeat(half | 0, chr);
}
function padRight(n, chr, str)
{
	return str + repeat(n - str.length, chr);
}
function padLeft(n, chr, str)
{
	return repeat(n - str.length, chr) + str;
}

function trim(str)
{
	return str.trim();
}
function trimLeft(str)
{
	return str.replace(/^\s+/, '');
}
function trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function words(str)
{
	return _elm_lang$core$Native_List.fromArray(str.trim().split(/\s+/g));
}
function lines(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(/\r\n|\r|\n/g));
}

function toUpper(str)
{
	return str.toUpperCase();
}
function toLower(str)
{
	return str.toLowerCase();
}

function any(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return true;
		}
	}
	return false;
}
function all(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (!pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return false;
		}
	}
	return true;
}

function contains(sub, str)
{
	return str.indexOf(sub) > -1;
}
function startsWith(sub, str)
{
	return str.indexOf(sub) === 0;
}
function endsWith(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
}
function indexes(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _elm_lang$core$Native_List.Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _elm_lang$core$Native_List.fromArray(is);
}


function toInt(s)
{
	var len = s.length;

	// if empty
	if (len === 0)
	{
		return intErr(s);
	}

	// if hex
	var c = s[0];
	if (c === '0' && s[1] === 'x')
	{
		for (var i = 2; i < len; ++i)
		{
			var c = s[i];
			if (('0' <= c && c <= '9') || ('A' <= c && c <= 'F') || ('a' <= c && c <= 'f'))
			{
				continue;
			}
			return intErr(s);
		}
		return _elm_lang$core$Result$Ok(parseInt(s, 16));
	}

	// is decimal
	if (c > '9' || (c < '0' && c !== '-' && c !== '+'))
	{
		return intErr(s);
	}
	for (var i = 1; i < len; ++i)
	{
		var c = s[i];
		if (c < '0' || '9' < c)
		{
			return intErr(s);
		}
	}

	return _elm_lang$core$Result$Ok(parseInt(s, 10));
}

function intErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int");
}


function toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return floatErr(s);
	}
	var n = +s;
	// faster isNaN check
	return n === n ? _elm_lang$core$Result$Ok(n) : floatErr(s);
}

function floatErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float");
}


function toList(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split('').map(_elm_lang$core$Native_Utils.chr));
}
function fromList(chars)
{
	return _elm_lang$core$Native_List.toArray(chars).join('');
}

return {
	isEmpty: isEmpty,
	cons: F2(cons),
	uncons: uncons,
	append: F2(append),
	concat: concat,
	length: length,
	map: F2(map),
	filter: F2(filter),
	reverse: reverse,
	foldl: F3(foldl),
	foldr: F3(foldr),

	split: F2(split),
	join: F2(join),
	repeat: F2(repeat),

	slice: F3(slice),
	left: F2(left),
	right: F2(right),
	dropLeft: F2(dropLeft),
	dropRight: F2(dropRight),

	pad: F3(pad),
	padLeft: F3(padLeft),
	padRight: F3(padRight),

	trim: trim,
	trimLeft: trimLeft,
	trimRight: trimRight,

	words: words,
	lines: lines,

	toUpper: toUpper,
	toLower: toLower,

	any: F2(any),
	all: F2(all),

	contains: F2(contains),
	startsWith: F2(startsWith),
	endsWith: F2(endsWith),
	indexes: F2(indexes),

	toInt: toInt,
	toFloat: toFloat,
	toList: toList,
	fromList: fromList
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Char = function() {

return {
	fromCode: function(c) { return _elm_lang$core$Native_Utils.chr(String.fromCharCode(c)); },
	toCode: function(c) { return c.charCodeAt(0); },
	toUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toUpperCase()); },
	toLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLowerCase()); },
	toLocaleUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleUpperCase()); },
	toLocaleLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleLowerCase()); }
};

}();
var _elm_lang$core$Char$fromCode = _elm_lang$core$Native_Char.fromCode;
var _elm_lang$core$Char$toCode = _elm_lang$core$Native_Char.toCode;
var _elm_lang$core$Char$toLocaleLower = _elm_lang$core$Native_Char.toLocaleLower;
var _elm_lang$core$Char$toLocaleUpper = _elm_lang$core$Native_Char.toLocaleUpper;
var _elm_lang$core$Char$toLower = _elm_lang$core$Native_Char.toLower;
var _elm_lang$core$Char$toUpper = _elm_lang$core$Native_Char.toUpper;
var _elm_lang$core$Char$isBetween = F3(
	function (low, high, $char) {
		var code = _elm_lang$core$Char$toCode($char);
		return (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(low)) > -1) && (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(high)) < 1);
	});
var _elm_lang$core$Char$isUpper = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('A'),
	_elm_lang$core$Native_Utils.chr('Z'));
var _elm_lang$core$Char$isLower = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('a'),
	_elm_lang$core$Native_Utils.chr('z'));
var _elm_lang$core$Char$isDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('9'));
var _elm_lang$core$Char$isOctDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('7'));
var _elm_lang$core$Char$isHexDigit = function ($char) {
	return _elm_lang$core$Char$isDigit($char) || (A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('a'),
		_elm_lang$core$Native_Utils.chr('f'),
		$char) || A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('A'),
		_elm_lang$core$Native_Utils.chr('F'),
		$char));
};

var _elm_lang$core$Result$toMaybe = function (result) {
	var _p0 = result;
	if (_p0.ctor === 'Ok') {
		return _elm_lang$core$Maybe$Just(_p0._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$Result$withDefault = F2(
	function (def, result) {
		var _p1 = result;
		if (_p1.ctor === 'Ok') {
			return _p1._0;
		} else {
			return def;
		}
	});
var _elm_lang$core$Result$Err = function (a) {
	return {ctor: 'Err', _0: a};
};
var _elm_lang$core$Result$andThen = F2(
	function (callback, result) {
		var _p2 = result;
		if (_p2.ctor === 'Ok') {
			return callback(_p2._0);
		} else {
			return _elm_lang$core$Result$Err(_p2._0);
		}
	});
var _elm_lang$core$Result$Ok = function (a) {
	return {ctor: 'Ok', _0: a};
};
var _elm_lang$core$Result$map = F2(
	function (func, ra) {
		var _p3 = ra;
		if (_p3.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(
				func(_p3._0));
		} else {
			return _elm_lang$core$Result$Err(_p3._0);
		}
	});
var _elm_lang$core$Result$map2 = F3(
	function (func, ra, rb) {
		var _p4 = {ctor: '_Tuple2', _0: ra, _1: rb};
		if (_p4._0.ctor === 'Ok') {
			if (_p4._1.ctor === 'Ok') {
				return _elm_lang$core$Result$Ok(
					A2(func, _p4._0._0, _p4._1._0));
			} else {
				return _elm_lang$core$Result$Err(_p4._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p4._0._0);
		}
	});
var _elm_lang$core$Result$map3 = F4(
	function (func, ra, rb, rc) {
		var _p5 = {ctor: '_Tuple3', _0: ra, _1: rb, _2: rc};
		if (_p5._0.ctor === 'Ok') {
			if (_p5._1.ctor === 'Ok') {
				if (_p5._2.ctor === 'Ok') {
					return _elm_lang$core$Result$Ok(
						A3(func, _p5._0._0, _p5._1._0, _p5._2._0));
				} else {
					return _elm_lang$core$Result$Err(_p5._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p5._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p5._0._0);
		}
	});
var _elm_lang$core$Result$map4 = F5(
	function (func, ra, rb, rc, rd) {
		var _p6 = {ctor: '_Tuple4', _0: ra, _1: rb, _2: rc, _3: rd};
		if (_p6._0.ctor === 'Ok') {
			if (_p6._1.ctor === 'Ok') {
				if (_p6._2.ctor === 'Ok') {
					if (_p6._3.ctor === 'Ok') {
						return _elm_lang$core$Result$Ok(
							A4(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0));
					} else {
						return _elm_lang$core$Result$Err(_p6._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p6._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p6._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p6._0._0);
		}
	});
var _elm_lang$core$Result$map5 = F6(
	function (func, ra, rb, rc, rd, re) {
		var _p7 = {ctor: '_Tuple5', _0: ra, _1: rb, _2: rc, _3: rd, _4: re};
		if (_p7._0.ctor === 'Ok') {
			if (_p7._1.ctor === 'Ok') {
				if (_p7._2.ctor === 'Ok') {
					if (_p7._3.ctor === 'Ok') {
						if (_p7._4.ctor === 'Ok') {
							return _elm_lang$core$Result$Ok(
								A5(func, _p7._0._0, _p7._1._0, _p7._2._0, _p7._3._0, _p7._4._0));
						} else {
							return _elm_lang$core$Result$Err(_p7._4._0);
						}
					} else {
						return _elm_lang$core$Result$Err(_p7._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p7._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p7._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p7._0._0);
		}
	});
var _elm_lang$core$Result$mapError = F2(
	function (f, result) {
		var _p8 = result;
		if (_p8.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(_p8._0);
		} else {
			return _elm_lang$core$Result$Err(
				f(_p8._0));
		}
	});
var _elm_lang$core$Result$fromMaybe = F2(
	function (err, maybe) {
		var _p9 = maybe;
		if (_p9.ctor === 'Just') {
			return _elm_lang$core$Result$Ok(_p9._0);
		} else {
			return _elm_lang$core$Result$Err(err);
		}
	});

var _elm_lang$core$String$fromList = _elm_lang$core$Native_String.fromList;
var _elm_lang$core$String$toList = _elm_lang$core$Native_String.toList;
var _elm_lang$core$String$toFloat = _elm_lang$core$Native_String.toFloat;
var _elm_lang$core$String$toInt = _elm_lang$core$Native_String.toInt;
var _elm_lang$core$String$indices = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$indexes = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$endsWith = _elm_lang$core$Native_String.endsWith;
var _elm_lang$core$String$startsWith = _elm_lang$core$Native_String.startsWith;
var _elm_lang$core$String$contains = _elm_lang$core$Native_String.contains;
var _elm_lang$core$String$all = _elm_lang$core$Native_String.all;
var _elm_lang$core$String$any = _elm_lang$core$Native_String.any;
var _elm_lang$core$String$toLower = _elm_lang$core$Native_String.toLower;
var _elm_lang$core$String$toUpper = _elm_lang$core$Native_String.toUpper;
var _elm_lang$core$String$lines = _elm_lang$core$Native_String.lines;
var _elm_lang$core$String$words = _elm_lang$core$Native_String.words;
var _elm_lang$core$String$trimRight = _elm_lang$core$Native_String.trimRight;
var _elm_lang$core$String$trimLeft = _elm_lang$core$Native_String.trimLeft;
var _elm_lang$core$String$trim = _elm_lang$core$Native_String.trim;
var _elm_lang$core$String$padRight = _elm_lang$core$Native_String.padRight;
var _elm_lang$core$String$padLeft = _elm_lang$core$Native_String.padLeft;
var _elm_lang$core$String$pad = _elm_lang$core$Native_String.pad;
var _elm_lang$core$String$dropRight = _elm_lang$core$Native_String.dropRight;
var _elm_lang$core$String$dropLeft = _elm_lang$core$Native_String.dropLeft;
var _elm_lang$core$String$right = _elm_lang$core$Native_String.right;
var _elm_lang$core$String$left = _elm_lang$core$Native_String.left;
var _elm_lang$core$String$slice = _elm_lang$core$Native_String.slice;
var _elm_lang$core$String$repeat = _elm_lang$core$Native_String.repeat;
var _elm_lang$core$String$join = _elm_lang$core$Native_String.join;
var _elm_lang$core$String$split = _elm_lang$core$Native_String.split;
var _elm_lang$core$String$foldr = _elm_lang$core$Native_String.foldr;
var _elm_lang$core$String$foldl = _elm_lang$core$Native_String.foldl;
var _elm_lang$core$String$reverse = _elm_lang$core$Native_String.reverse;
var _elm_lang$core$String$filter = _elm_lang$core$Native_String.filter;
var _elm_lang$core$String$map = _elm_lang$core$Native_String.map;
var _elm_lang$core$String$length = _elm_lang$core$Native_String.length;
var _elm_lang$core$String$concat = _elm_lang$core$Native_String.concat;
var _elm_lang$core$String$append = _elm_lang$core$Native_String.append;
var _elm_lang$core$String$uncons = _elm_lang$core$Native_String.uncons;
var _elm_lang$core$String$cons = _elm_lang$core$Native_String.cons;
var _elm_lang$core$String$fromChar = function ($char) {
	return A2(_elm_lang$core$String$cons, $char, '');
};
var _elm_lang$core$String$isEmpty = _elm_lang$core$Native_String.isEmpty;

var _elm_lang$core$Dict$foldr = F3(
	function (f, acc, t) {
		foldr:
		while (true) {
			var _p0 = t;
			if (_p0.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v1 = f,
					_v2 = A3(
					f,
					_p0._1,
					_p0._2,
					A3(_elm_lang$core$Dict$foldr, f, acc, _p0._4)),
					_v3 = _p0._3;
				f = _v1;
				acc = _v2;
				t = _v3;
				continue foldr;
			}
		}
	});
var _elm_lang$core$Dict$keys = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return {ctor: '::', _0: key, _1: keyList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$values = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, valueList) {
				return {ctor: '::', _0: value, _1: valueList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$toList = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: key, _1: value},
					_1: list
				};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$foldl = F3(
	function (f, acc, dict) {
		foldl:
		while (true) {
			var _p1 = dict;
			if (_p1.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v5 = f,
					_v6 = A3(
					f,
					_p1._1,
					_p1._2,
					A3(_elm_lang$core$Dict$foldl, f, acc, _p1._3)),
					_v7 = _p1._4;
				f = _v5;
				acc = _v6;
				dict = _v7;
				continue foldl;
			}
		}
	});
var _elm_lang$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _p2) {
				stepState:
				while (true) {
					var _p3 = _p2;
					var _p9 = _p3._1;
					var _p8 = _p3._0;
					var _p4 = _p8;
					if (_p4.ctor === '[]') {
						return {
							ctor: '_Tuple2',
							_0: _p8,
							_1: A3(rightStep, rKey, rValue, _p9)
						};
					} else {
						var _p7 = _p4._1;
						var _p6 = _p4._0._1;
						var _p5 = _p4._0._0;
						if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) < 0) {
							var _v10 = rKey,
								_v11 = rValue,
								_v12 = {
								ctor: '_Tuple2',
								_0: _p7,
								_1: A3(leftStep, _p5, _p6, _p9)
							};
							rKey = _v10;
							rValue = _v11;
							_p2 = _v12;
							continue stepState;
						} else {
							if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) > 0) {
								return {
									ctor: '_Tuple2',
									_0: _p8,
									_1: A3(rightStep, rKey, rValue, _p9)
								};
							} else {
								return {
									ctor: '_Tuple2',
									_0: _p7,
									_1: A4(bothStep, _p5, _p6, rValue, _p9)
								};
							}
						}
					}
				}
			});
		var _p10 = A3(
			_elm_lang$core$Dict$foldl,
			stepState,
			{
				ctor: '_Tuple2',
				_0: _elm_lang$core$Dict$toList(leftDict),
				_1: initialResult
			},
			rightDict);
		var leftovers = _p10._0;
		var intermediateResult = _p10._1;
		return A3(
			_elm_lang$core$List$foldl,
			F2(
				function (_p11, result) {
					var _p12 = _p11;
					return A3(leftStep, _p12._0, _p12._1, result);
				}),
			intermediateResult,
			leftovers);
	});
var _elm_lang$core$Dict$reportRemBug = F4(
	function (msg, c, lgot, rgot) {
		return _elm_lang$core$Native_Debug.crash(
			_elm_lang$core$String$concat(
				{
					ctor: '::',
					_0: 'Internal red-black tree invariant violated, expected ',
					_1: {
						ctor: '::',
						_0: msg,
						_1: {
							ctor: '::',
							_0: ' and got ',
							_1: {
								ctor: '::',
								_0: _elm_lang$core$Basics$toString(c),
								_1: {
									ctor: '::',
									_0: '/',
									_1: {
										ctor: '::',
										_0: lgot,
										_1: {
											ctor: '::',
											_0: '/',
											_1: {
												ctor: '::',
												_0: rgot,
												_1: {
													ctor: '::',
													_0: '\nPlease report this bug to <https://github.com/elm-lang/core/issues>',
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						}
					}
				}));
	});
var _elm_lang$core$Dict$isBBlack = function (dict) {
	var _p13 = dict;
	_v14_2:
	do {
		if (_p13.ctor === 'RBNode_elm_builtin') {
			if (_p13._0.ctor === 'BBlack') {
				return true;
			} else {
				break _v14_2;
			}
		} else {
			if (_p13._0.ctor === 'LBBlack') {
				return true;
			} else {
				break _v14_2;
			}
		}
	} while(false);
	return false;
};
var _elm_lang$core$Dict$sizeHelp = F2(
	function (n, dict) {
		sizeHelp:
		while (true) {
			var _p14 = dict;
			if (_p14.ctor === 'RBEmpty_elm_builtin') {
				return n;
			} else {
				var _v16 = A2(_elm_lang$core$Dict$sizeHelp, n + 1, _p14._4),
					_v17 = _p14._3;
				n = _v16;
				dict = _v17;
				continue sizeHelp;
			}
		}
	});
var _elm_lang$core$Dict$size = function (dict) {
	return A2(_elm_lang$core$Dict$sizeHelp, 0, dict);
};
var _elm_lang$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			var _p15 = dict;
			if (_p15.ctor === 'RBEmpty_elm_builtin') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p16 = A2(_elm_lang$core$Basics$compare, targetKey, _p15._1);
				switch (_p16.ctor) {
					case 'LT':
						var _v20 = targetKey,
							_v21 = _p15._3;
						targetKey = _v20;
						dict = _v21;
						continue get;
					case 'EQ':
						return _elm_lang$core$Maybe$Just(_p15._2);
					default:
						var _v22 = targetKey,
							_v23 = _p15._4;
						targetKey = _v22;
						dict = _v23;
						continue get;
				}
			}
		}
	});
var _elm_lang$core$Dict$member = F2(
	function (key, dict) {
		var _p17 = A2(_elm_lang$core$Dict$get, key, dict);
		if (_p17.ctor === 'Just') {
			return true;
		} else {
			return false;
		}
	});
var _elm_lang$core$Dict$maxWithDefault = F3(
	function (k, v, r) {
		maxWithDefault:
		while (true) {
			var _p18 = r;
			if (_p18.ctor === 'RBEmpty_elm_builtin') {
				return {ctor: '_Tuple2', _0: k, _1: v};
			} else {
				var _v26 = _p18._1,
					_v27 = _p18._2,
					_v28 = _p18._4;
				k = _v26;
				v = _v27;
				r = _v28;
				continue maxWithDefault;
			}
		}
	});
var _elm_lang$core$Dict$NBlack = {ctor: 'NBlack'};
var _elm_lang$core$Dict$BBlack = {ctor: 'BBlack'};
var _elm_lang$core$Dict$Black = {ctor: 'Black'};
var _elm_lang$core$Dict$blackish = function (t) {
	var _p19 = t;
	if (_p19.ctor === 'RBNode_elm_builtin') {
		var _p20 = _p19._0;
		return _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$Black) || _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$BBlack);
	} else {
		return true;
	}
};
var _elm_lang$core$Dict$Red = {ctor: 'Red'};
var _elm_lang$core$Dict$moreBlack = function (color) {
	var _p21 = color;
	switch (_p21.ctor) {
		case 'Black':
			return _elm_lang$core$Dict$BBlack;
		case 'Red':
			return _elm_lang$core$Dict$Black;
		case 'NBlack':
			return _elm_lang$core$Dict$Red;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a double black node more black!');
	}
};
var _elm_lang$core$Dict$lessBlack = function (color) {
	var _p22 = color;
	switch (_p22.ctor) {
		case 'BBlack':
			return _elm_lang$core$Dict$Black;
		case 'Black':
			return _elm_lang$core$Dict$Red;
		case 'Red':
			return _elm_lang$core$Dict$NBlack;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a negative black node less black!');
	}
};
var _elm_lang$core$Dict$LBBlack = {ctor: 'LBBlack'};
var _elm_lang$core$Dict$LBlack = {ctor: 'LBlack'};
var _elm_lang$core$Dict$RBEmpty_elm_builtin = function (a) {
	return {ctor: 'RBEmpty_elm_builtin', _0: a};
};
var _elm_lang$core$Dict$empty = _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
var _elm_lang$core$Dict$isEmpty = function (dict) {
	return _elm_lang$core$Native_Utils.eq(dict, _elm_lang$core$Dict$empty);
};
var _elm_lang$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {ctor: 'RBNode_elm_builtin', _0: a, _1: b, _2: c, _3: d, _4: e};
	});
var _elm_lang$core$Dict$ensureBlackRoot = function (dict) {
	var _p23 = dict;
	if ((_p23.ctor === 'RBNode_elm_builtin') && (_p23._0.ctor === 'Red')) {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p23._1, _p23._2, _p23._3, _p23._4);
	} else {
		return dict;
	}
};
var _elm_lang$core$Dict$lessBlackTree = function (dict) {
	var _p24 = dict;
	if (_p24.ctor === 'RBNode_elm_builtin') {
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$lessBlack(_p24._0),
			_p24._1,
			_p24._2,
			_p24._3,
			_p24._4);
	} else {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	}
};
var _elm_lang$core$Dict$balancedTree = function (col) {
	return function (xk) {
		return function (xv) {
			return function (yk) {
				return function (yv) {
					return function (zk) {
						return function (zv) {
							return function (a) {
								return function (b) {
									return function (c) {
										return function (d) {
											return A5(
												_elm_lang$core$Dict$RBNode_elm_builtin,
												_elm_lang$core$Dict$lessBlack(col),
												yk,
												yv,
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, xk, xv, a, b),
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, zk, zv, c, d));
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _elm_lang$core$Dict$blacken = function (t) {
	var _p25 = t;
	if (_p25.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p25._1, _p25._2, _p25._3, _p25._4);
	}
};
var _elm_lang$core$Dict$redden = function (t) {
	var _p26 = t;
	if (_p26.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Native_Debug.crash('can\'t make a Leaf red');
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, _p26._1, _p26._2, _p26._3, _p26._4);
	}
};
var _elm_lang$core$Dict$balanceHelp = function (tree) {
	var _p27 = tree;
	_v36_6:
	do {
		_v36_5:
		do {
			_v36_4:
			do {
				_v36_3:
				do {
					_v36_2:
					do {
						_v36_1:
						do {
							_v36_0:
							do {
								if (_p27.ctor === 'RBNode_elm_builtin') {
									if (_p27._3.ctor === 'RBNode_elm_builtin') {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._3._0.ctor) {
												case 'Red':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																		break _v36_2;
																	} else {
																		if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																			break _v36_3;
																		} else {
																			break _v36_6;
																		}
																	}
																}
															}
														case 'NBlack':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																		break _v36_4;
																	} else {
																		break _v36_6;
																	}
																}
															}
														default:
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	break _v36_6;
																}
															}
													}
												case 'NBlack':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															}
														case 'NBlack':
															if (_p27._0.ctor === 'BBlack') {
																if ((((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																	break _v36_4;
																} else {
																	if ((((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															} else {
																break _v36_6;
															}
														default:
															if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																break _v36_5;
															} else {
																break _v36_6;
															}
													}
												default:
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	break _v36_6;
																}
															}
														case 'NBlack':
															if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																break _v36_4;
															} else {
																break _v36_6;
															}
														default:
															break _v36_6;
													}
											}
										} else {
											switch (_p27._3._0.ctor) {
												case 'Red':
													if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
														break _v36_0;
													} else {
														if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
															break _v36_1;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
														break _v36_5;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										}
									} else {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._4._0.ctor) {
												case 'Red':
													if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
														break _v36_2;
													} else {
														if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
															break _v36_3;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
														break _v36_4;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										} else {
											break _v36_6;
										}
									}
								} else {
									break _v36_6;
								}
							} while(false);
							return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._3._1)(_p27._3._3._2)(_p27._3._1)(_p27._3._2)(_p27._1)(_p27._2)(_p27._3._3._3)(_p27._3._3._4)(_p27._3._4)(_p27._4);
						} while(false);
						return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._1)(_p27._3._2)(_p27._3._4._1)(_p27._3._4._2)(_p27._1)(_p27._2)(_p27._3._3)(_p27._3._4._3)(_p27._3._4._4)(_p27._4);
					} while(false);
					return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._3._1)(_p27._4._3._2)(_p27._4._1)(_p27._4._2)(_p27._3)(_p27._4._3._3)(_p27._4._3._4)(_p27._4._4);
				} while(false);
				return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._1)(_p27._4._2)(_p27._4._4._1)(_p27._4._4._2)(_p27._3)(_p27._4._3)(_p27._4._4._3)(_p27._4._4._4);
			} while(false);
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_elm_lang$core$Dict$Black,
				_p27._4._3._1,
				_p27._4._3._2,
				A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3, _p27._4._3._3),
				A5(
					_elm_lang$core$Dict$balance,
					_elm_lang$core$Dict$Black,
					_p27._4._1,
					_p27._4._2,
					_p27._4._3._4,
					_elm_lang$core$Dict$redden(_p27._4._4)));
		} while(false);
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$Black,
			_p27._3._4._1,
			_p27._3._4._2,
			A5(
				_elm_lang$core$Dict$balance,
				_elm_lang$core$Dict$Black,
				_p27._3._1,
				_p27._3._2,
				_elm_lang$core$Dict$redden(_p27._3._3),
				_p27._3._4._3),
			A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3._4._4, _p27._4));
	} while(false);
	return tree;
};
var _elm_lang$core$Dict$balance = F5(
	function (c, k, v, l, r) {
		var tree = A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
		return _elm_lang$core$Dict$blackish(tree) ? _elm_lang$core$Dict$balanceHelp(tree) : tree;
	});
var _elm_lang$core$Dict$bubble = F5(
	function (c, k, v, l, r) {
		return (_elm_lang$core$Dict$isBBlack(l) || _elm_lang$core$Dict$isBBlack(r)) ? A5(
			_elm_lang$core$Dict$balance,
			_elm_lang$core$Dict$moreBlack(c),
			k,
			v,
			_elm_lang$core$Dict$lessBlackTree(l),
			_elm_lang$core$Dict$lessBlackTree(r)) : A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
	});
var _elm_lang$core$Dict$removeMax = F5(
	function (c, k, v, l, r) {
		var _p28 = r;
		if (_p28.ctor === 'RBEmpty_elm_builtin') {
			return A3(_elm_lang$core$Dict$rem, c, l, r);
		} else {
			return A5(
				_elm_lang$core$Dict$bubble,
				c,
				k,
				v,
				l,
				A5(_elm_lang$core$Dict$removeMax, _p28._0, _p28._1, _p28._2, _p28._3, _p28._4));
		}
	});
var _elm_lang$core$Dict$rem = F3(
	function (color, left, right) {
		var _p29 = {ctor: '_Tuple2', _0: left, _1: right};
		if (_p29._0.ctor === 'RBEmpty_elm_builtin') {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p30 = color;
				switch (_p30.ctor) {
					case 'Red':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
					case 'Black':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBBlack);
					default:
						return _elm_lang$core$Native_Debug.crash('cannot have bblack or nblack nodes at this point');
				}
			} else {
				var _p33 = _p29._1._0;
				var _p32 = _p29._0._0;
				var _p31 = {ctor: '_Tuple3', _0: color, _1: _p32, _2: _p33};
				if ((((_p31.ctor === '_Tuple3') && (_p31._0.ctor === 'Black')) && (_p31._1.ctor === 'LBlack')) && (_p31._2.ctor === 'Red')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._1._1, _p29._1._2, _p29._1._3, _p29._1._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/LBlack/Red',
						color,
						_elm_lang$core$Basics$toString(_p32),
						_elm_lang$core$Basics$toString(_p33));
				}
			}
		} else {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p36 = _p29._1._0;
				var _p35 = _p29._0._0;
				var _p34 = {ctor: '_Tuple3', _0: color, _1: _p35, _2: _p36};
				if ((((_p34.ctor === '_Tuple3') && (_p34._0.ctor === 'Black')) && (_p34._1.ctor === 'Red')) && (_p34._2.ctor === 'LBlack')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._0._1, _p29._0._2, _p29._0._3, _p29._0._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/Red/LBlack',
						color,
						_elm_lang$core$Basics$toString(_p35),
						_elm_lang$core$Basics$toString(_p36));
				}
			} else {
				var _p40 = _p29._0._2;
				var _p39 = _p29._0._4;
				var _p38 = _p29._0._1;
				var newLeft = A5(_elm_lang$core$Dict$removeMax, _p29._0._0, _p38, _p40, _p29._0._3, _p39);
				var _p37 = A3(_elm_lang$core$Dict$maxWithDefault, _p38, _p40, _p39);
				var k = _p37._0;
				var v = _p37._1;
				return A5(_elm_lang$core$Dict$bubble, color, k, v, newLeft, right);
			}
		}
	});
var _elm_lang$core$Dict$map = F2(
	function (f, dict) {
		var _p41 = dict;
		if (_p41.ctor === 'RBEmpty_elm_builtin') {
			return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
		} else {
			var _p42 = _p41._1;
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_p41._0,
				_p42,
				A2(f, _p42, _p41._2),
				A2(_elm_lang$core$Dict$map, f, _p41._3),
				A2(_elm_lang$core$Dict$map, f, _p41._4));
		}
	});
var _elm_lang$core$Dict$Same = {ctor: 'Same'};
var _elm_lang$core$Dict$Remove = {ctor: 'Remove'};
var _elm_lang$core$Dict$Insert = {ctor: 'Insert'};
var _elm_lang$core$Dict$update = F3(
	function (k, alter, dict) {
		var up = function (dict) {
			var _p43 = dict;
			if (_p43.ctor === 'RBEmpty_elm_builtin') {
				var _p44 = alter(_elm_lang$core$Maybe$Nothing);
				if (_p44.ctor === 'Nothing') {
					return {ctor: '_Tuple2', _0: _elm_lang$core$Dict$Same, _1: _elm_lang$core$Dict$empty};
				} else {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Dict$Insert,
						_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, k, _p44._0, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty)
					};
				}
			} else {
				var _p55 = _p43._2;
				var _p54 = _p43._4;
				var _p53 = _p43._3;
				var _p52 = _p43._1;
				var _p51 = _p43._0;
				var _p45 = A2(_elm_lang$core$Basics$compare, k, _p52);
				switch (_p45.ctor) {
					case 'EQ':
						var _p46 = alter(
							_elm_lang$core$Maybe$Just(_p55));
						if (_p46.ctor === 'Nothing') {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Remove,
								_1: A3(_elm_lang$core$Dict$rem, _p51, _p53, _p54)
							};
						} else {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Same,
								_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p46._0, _p53, _p54)
							};
						}
					case 'LT':
						var _p47 = up(_p53);
						var flag = _p47._0;
						var newLeft = _p47._1;
						var _p48 = flag;
						switch (_p48.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, newLeft, _p54)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, newLeft, _p54)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, newLeft, _p54)
								};
						}
					default:
						var _p49 = up(_p54);
						var flag = _p49._0;
						var newRight = _p49._1;
						var _p50 = flag;
						switch (_p50.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, _p53, newRight)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, _p53, newRight)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, _p53, newRight)
								};
						}
				}
			}
		};
		var _p56 = up(dict);
		var flag = _p56._0;
		var updatedDict = _p56._1;
		var _p57 = flag;
		switch (_p57.ctor) {
			case 'Same':
				return updatedDict;
			case 'Insert':
				return _elm_lang$core$Dict$ensureBlackRoot(updatedDict);
			default:
				return _elm_lang$core$Dict$blacken(updatedDict);
		}
	});
var _elm_lang$core$Dict$insert = F3(
	function (key, value, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(
				_elm_lang$core$Maybe$Just(value)),
			dict);
	});
var _elm_lang$core$Dict$singleton = F2(
	function (key, value) {
		return A3(_elm_lang$core$Dict$insert, key, value, _elm_lang$core$Dict$empty);
	});
var _elm_lang$core$Dict$union = F2(
	function (t1, t2) {
		return A3(_elm_lang$core$Dict$foldl, _elm_lang$core$Dict$insert, t2, t1);
	});
var _elm_lang$core$Dict$filter = F2(
	function (predicate, dictionary) {
		var add = F3(
			function (key, value, dict) {
				return A2(predicate, key, value) ? A3(_elm_lang$core$Dict$insert, key, value, dict) : dict;
			});
		return A3(_elm_lang$core$Dict$foldl, add, _elm_lang$core$Dict$empty, dictionary);
	});
var _elm_lang$core$Dict$intersect = F2(
	function (t1, t2) {
		return A2(
			_elm_lang$core$Dict$filter,
			F2(
				function (k, _p58) {
					return A2(_elm_lang$core$Dict$member, k, t2);
				}),
			t1);
	});
var _elm_lang$core$Dict$partition = F2(
	function (predicate, dict) {
		var add = F3(
			function (key, value, _p59) {
				var _p60 = _p59;
				var _p62 = _p60._1;
				var _p61 = _p60._0;
				return A2(predicate, key, value) ? {
					ctor: '_Tuple2',
					_0: A3(_elm_lang$core$Dict$insert, key, value, _p61),
					_1: _p62
				} : {
					ctor: '_Tuple2',
					_0: _p61,
					_1: A3(_elm_lang$core$Dict$insert, key, value, _p62)
				};
			});
		return A3(
			_elm_lang$core$Dict$foldl,
			add,
			{ctor: '_Tuple2', _0: _elm_lang$core$Dict$empty, _1: _elm_lang$core$Dict$empty},
			dict);
	});
var _elm_lang$core$Dict$fromList = function (assocs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p63, dict) {
				var _p64 = _p63;
				return A3(_elm_lang$core$Dict$insert, _p64._0, _p64._1, dict);
			}),
		_elm_lang$core$Dict$empty,
		assocs);
};
var _elm_lang$core$Dict$remove = F2(
	function (key, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing),
			dict);
	});
var _elm_lang$core$Dict$diff = F2(
	function (t1, t2) {
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, v, t) {
					return A2(_elm_lang$core$Dict$remove, k, t);
				}),
			t1,
			t2);
	});

//import Maybe, Native.Array, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_Json = function() {


// CORE DECODERS

function succeed(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'succeed',
		msg: msg
	};
}

function fail(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'fail',
		msg: msg
	};
}

function decodePrimitive(tag)
{
	return {
		ctor: '<decoder>',
		tag: tag
	};
}

function decodeContainer(tag, decoder)
{
	return {
		ctor: '<decoder>',
		tag: tag,
		decoder: decoder
	};
}

function decodeNull(value)
{
	return {
		ctor: '<decoder>',
		tag: 'null',
		value: value
	};
}

function decodeField(field, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'field',
		field: field,
		decoder: decoder
	};
}

function decodeIndex(index, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'index',
		index: index,
		decoder: decoder
	};
}

function decodeKeyValuePairs(decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'key-value',
		decoder: decoder
	};
}

function mapMany(f, decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'map-many',
		func: f,
		decoders: decoders
	};
}

function andThen(callback, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'andThen',
		decoder: decoder,
		callback: callback
	};
}

function oneOf(decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'oneOf',
		decoders: decoders
	};
}


// DECODING OBJECTS

function map1(f, d1)
{
	return mapMany(f, [d1]);
}

function map2(f, d1, d2)
{
	return mapMany(f, [d1, d2]);
}

function map3(f, d1, d2, d3)
{
	return mapMany(f, [d1, d2, d3]);
}

function map4(f, d1, d2, d3, d4)
{
	return mapMany(f, [d1, d2, d3, d4]);
}

function map5(f, d1, d2, d3, d4, d5)
{
	return mapMany(f, [d1, d2, d3, d4, d5]);
}

function map6(f, d1, d2, d3, d4, d5, d6)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6]);
}

function map7(f, d1, d2, d3, d4, d5, d6, d7)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
}

function map8(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
}


// DECODE HELPERS

function ok(value)
{
	return { tag: 'ok', value: value };
}

function badPrimitive(type, value)
{
	return { tag: 'primitive', type: type, value: value };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badField(field, nestedProblems)
{
	return { tag: 'field', field: field, rest: nestedProblems };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badOneOf(problems)
{
	return { tag: 'oneOf', problems: problems };
}

function bad(msg)
{
	return { tag: 'fail', msg: msg };
}

function badToString(problem)
{
	var context = '_';
	while (problem)
	{
		switch (problem.tag)
		{
			case 'primitive':
				return 'Expecting ' + problem.type
					+ (context === '_' ? '' : ' at ' + context)
					+ ' but instead got: ' + jsToString(problem.value);

			case 'index':
				context += '[' + problem.index + ']';
				problem = problem.rest;
				break;

			case 'field':
				context += '.' + problem.field;
				problem = problem.rest;
				break;

			case 'oneOf':
				var problems = problem.problems;
				for (var i = 0; i < problems.length; i++)
				{
					problems[i] = badToString(problems[i]);
				}
				return 'I ran into the following problems'
					+ (context === '_' ? '' : ' at ' + context)
					+ ':\n\n' + problems.join('\n');

			case 'fail':
				return 'I ran into a `fail` decoder'
					+ (context === '_' ? '' : ' at ' + context)
					+ ': ' + problem.msg;
		}
	}
}

function jsToString(value)
{
	return value === undefined
		? 'undefined'
		: JSON.stringify(value);
}


// DECODE

function runOnString(decoder, string)
{
	var json;
	try
	{
		json = JSON.parse(string);
	}
	catch (e)
	{
		return _elm_lang$core$Result$Err('Given an invalid JSON: ' + e.message);
	}
	return run(decoder, json);
}

function run(decoder, value)
{
	var result = runHelp(decoder, value);
	return (result.tag === 'ok')
		? _elm_lang$core$Result$Ok(result.value)
		: _elm_lang$core$Result$Err(badToString(result));
}

function runHelp(decoder, value)
{
	switch (decoder.tag)
	{
		case 'bool':
			return (typeof value === 'boolean')
				? ok(value)
				: badPrimitive('a Bool', value);

		case 'int':
			if (typeof value !== 'number') {
				return badPrimitive('an Int', value);
			}

			if (-2147483647 < value && value < 2147483647 && (value | 0) === value) {
				return ok(value);
			}

			if (isFinite(value) && !(value % 1)) {
				return ok(value);
			}

			return badPrimitive('an Int', value);

		case 'float':
			return (typeof value === 'number')
				? ok(value)
				: badPrimitive('a Float', value);

		case 'string':
			return (typeof value === 'string')
				? ok(value)
				: (value instanceof String)
					? ok(value + '')
					: badPrimitive('a String', value);

		case 'null':
			return (value === null)
				? ok(decoder.value)
				: badPrimitive('null', value);

		case 'value':
			return ok(value);

		case 'list':
			if (!(value instanceof Array))
			{
				return badPrimitive('a List', value);
			}

			var list = _elm_lang$core$Native_List.Nil;
			for (var i = value.length; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result)
				}
				list = _elm_lang$core$Native_List.Cons(result.value, list);
			}
			return ok(list);

		case 'array':
			if (!(value instanceof Array))
			{
				return badPrimitive('an Array', value);
			}

			var len = value.length;
			var array = new Array(len);
			for (var i = len; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result);
				}
				array[i] = result.value;
			}
			return ok(_elm_lang$core$Native_Array.fromJSArray(array));

		case 'maybe':
			var result = runHelp(decoder.decoder, value);
			return (result.tag === 'ok')
				? ok(_elm_lang$core$Maybe$Just(result.value))
				: ok(_elm_lang$core$Maybe$Nothing);

		case 'field':
			var field = decoder.field;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return badPrimitive('an object with a field named `' + field + '`', value);
			}

			var result = runHelp(decoder.decoder, value[field]);
			return (result.tag === 'ok') ? result : badField(field, result);

		case 'index':
			var index = decoder.index;
			if (!(value instanceof Array))
			{
				return badPrimitive('an array', value);
			}
			if (index >= value.length)
			{
				return badPrimitive('a longer array. Need index ' + index + ' but there are only ' + value.length + ' entries', value);
			}

			var result = runHelp(decoder.decoder, value[index]);
			return (result.tag === 'ok') ? result : badIndex(index, result);

		case 'key-value':
			if (typeof value !== 'object' || value === null || value instanceof Array)
			{
				return badPrimitive('an object', value);
			}

			var keyValuePairs = _elm_lang$core$Native_List.Nil;
			for (var key in value)
			{
				var result = runHelp(decoder.decoder, value[key]);
				if (result.tag !== 'ok')
				{
					return badField(key, result);
				}
				var pair = _elm_lang$core$Native_Utils.Tuple2(key, result.value);
				keyValuePairs = _elm_lang$core$Native_List.Cons(pair, keyValuePairs);
			}
			return ok(keyValuePairs);

		case 'map-many':
			var answer = decoder.func;
			var decoders = decoder.decoders;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = runHelp(decoders[i], value);
				if (result.tag !== 'ok')
				{
					return result;
				}
				answer = answer(result.value);
			}
			return ok(answer);

		case 'andThen':
			var result = runHelp(decoder.decoder, value);
			return (result.tag !== 'ok')
				? result
				: runHelp(decoder.callback(result.value), value);

		case 'oneOf':
			var errors = [];
			var temp = decoder.decoders;
			while (temp.ctor !== '[]')
			{
				var result = runHelp(temp._0, value);

				if (result.tag === 'ok')
				{
					return result;
				}

				errors.push(result);

				temp = temp._1;
			}
			return badOneOf(errors);

		case 'fail':
			return bad(decoder.msg);

		case 'succeed':
			return ok(decoder.msg);
	}
}


// EQUALITY

function equality(a, b)
{
	if (a === b)
	{
		return true;
	}

	if (a.tag !== b.tag)
	{
		return false;
	}

	switch (a.tag)
	{
		case 'succeed':
		case 'fail':
			return a.msg === b.msg;

		case 'bool':
		case 'int':
		case 'float':
		case 'string':
		case 'value':
			return true;

		case 'null':
			return a.value === b.value;

		case 'list':
		case 'array':
		case 'maybe':
		case 'key-value':
			return equality(a.decoder, b.decoder);

		case 'field':
			return a.field === b.field && equality(a.decoder, b.decoder);

		case 'index':
			return a.index === b.index && equality(a.decoder, b.decoder);

		case 'map-many':
			if (a.func !== b.func)
			{
				return false;
			}
			return listEquality(a.decoders, b.decoders);

		case 'andThen':
			return a.callback === b.callback && equality(a.decoder, b.decoder);

		case 'oneOf':
			return listEquality(a.decoders, b.decoders);
	}
}

function listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

function encode(indentLevel, value)
{
	return JSON.stringify(value, null, indentLevel);
}

function identity(value)
{
	return value;
}

function encodeObject(keyValuePairs)
{
	var obj = {};
	while (keyValuePairs.ctor !== '[]')
	{
		var pair = keyValuePairs._0;
		obj[pair._0] = pair._1;
		keyValuePairs = keyValuePairs._1;
	}
	return obj;
}

return {
	encode: F2(encode),
	runOnString: F2(runOnString),
	run: F2(run),

	decodeNull: decodeNull,
	decodePrimitive: decodePrimitive,
	decodeContainer: F2(decodeContainer),

	decodeField: F2(decodeField),
	decodeIndex: F2(decodeIndex),

	map1: F2(map1),
	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	map6: F7(map6),
	map7: F8(map7),
	map8: F9(map8),
	decodeKeyValuePairs: decodeKeyValuePairs,

	andThen: F2(andThen),
	fail: fail,
	succeed: succeed,
	oneOf: oneOf,

	identity: identity,
	encodeNull: null,
	encodeArray: _elm_lang$core$Native_Array.toJSArray,
	encodeList: _elm_lang$core$Native_List.toArray,
	encodeObject: encodeObject,

	equality: equality
};

}();

var _elm_lang$core$Json_Encode$list = _elm_lang$core$Native_Json.encodeList;
var _elm_lang$core$Json_Encode$array = _elm_lang$core$Native_Json.encodeArray;
var _elm_lang$core$Json_Encode$object = _elm_lang$core$Native_Json.encodeObject;
var _elm_lang$core$Json_Encode$null = _elm_lang$core$Native_Json.encodeNull;
var _elm_lang$core$Json_Encode$bool = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$float = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$int = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$string = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$encode = _elm_lang$core$Native_Json.encode;
var _elm_lang$core$Json_Encode$Value = {ctor: 'Value'};

var _elm_lang$core$Json_Decode$null = _elm_lang$core$Native_Json.decodeNull;
var _elm_lang$core$Json_Decode$value = _elm_lang$core$Native_Json.decodePrimitive('value');
var _elm_lang$core$Json_Decode$andThen = _elm_lang$core$Native_Json.andThen;
var _elm_lang$core$Json_Decode$fail = _elm_lang$core$Native_Json.fail;
var _elm_lang$core$Json_Decode$succeed = _elm_lang$core$Native_Json.succeed;
var _elm_lang$core$Json_Decode$lazy = function (thunk) {
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		thunk,
		_elm_lang$core$Json_Decode$succeed(
			{ctor: '_Tuple0'}));
};
var _elm_lang$core$Json_Decode$decodeValue = _elm_lang$core$Native_Json.run;
var _elm_lang$core$Json_Decode$decodeString = _elm_lang$core$Native_Json.runOnString;
var _elm_lang$core$Json_Decode$map8 = _elm_lang$core$Native_Json.map8;
var _elm_lang$core$Json_Decode$map7 = _elm_lang$core$Native_Json.map7;
var _elm_lang$core$Json_Decode$map6 = _elm_lang$core$Native_Json.map6;
var _elm_lang$core$Json_Decode$map5 = _elm_lang$core$Native_Json.map5;
var _elm_lang$core$Json_Decode$map4 = _elm_lang$core$Native_Json.map4;
var _elm_lang$core$Json_Decode$map3 = _elm_lang$core$Native_Json.map3;
var _elm_lang$core$Json_Decode$map2 = _elm_lang$core$Native_Json.map2;
var _elm_lang$core$Json_Decode$map = _elm_lang$core$Native_Json.map1;
var _elm_lang$core$Json_Decode$oneOf = _elm_lang$core$Native_Json.oneOf;
var _elm_lang$core$Json_Decode$maybe = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'maybe', decoder);
};
var _elm_lang$core$Json_Decode$index = _elm_lang$core$Native_Json.decodeIndex;
var _elm_lang$core$Json_Decode$field = _elm_lang$core$Native_Json.decodeField;
var _elm_lang$core$Json_Decode$at = F2(
	function (fields, decoder) {
		return A3(_elm_lang$core$List$foldr, _elm_lang$core$Json_Decode$field, decoder, fields);
	});
var _elm_lang$core$Json_Decode$keyValuePairs = _elm_lang$core$Native_Json.decodeKeyValuePairs;
var _elm_lang$core$Json_Decode$dict = function (decoder) {
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$Dict$fromList,
		_elm_lang$core$Json_Decode$keyValuePairs(decoder));
};
var _elm_lang$core$Json_Decode$array = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'array', decoder);
};
var _elm_lang$core$Json_Decode$list = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'list', decoder);
};
var _elm_lang$core$Json_Decode$nullable = function (decoder) {
	return _elm_lang$core$Json_Decode$oneOf(
		{
			ctor: '::',
			_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
			_1: {
				ctor: '::',
				_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, decoder),
				_1: {ctor: '[]'}
			}
		});
};
var _elm_lang$core$Json_Decode$float = _elm_lang$core$Native_Json.decodePrimitive('float');
var _elm_lang$core$Json_Decode$int = _elm_lang$core$Native_Json.decodePrimitive('int');
var _elm_lang$core$Json_Decode$bool = _elm_lang$core$Native_Json.decodePrimitive('bool');
var _elm_lang$core$Json_Decode$string = _elm_lang$core$Native_Json.decodePrimitive('string');
var _elm_lang$core$Json_Decode$Decoder = {ctor: 'Decoder'};

var _elm_lang$core$Debug$crash = _elm_lang$core$Native_Debug.crash;
var _elm_lang$core$Debug$log = _elm_lang$core$Native_Debug.log;

var _elm_lang$core$Tuple$mapSecond = F2(
	function (func, _p0) {
		var _p1 = _p0;
		return {
			ctor: '_Tuple2',
			_0: _p1._0,
			_1: func(_p1._1)
		};
	});
var _elm_lang$core$Tuple$mapFirst = F2(
	function (func, _p2) {
		var _p3 = _p2;
		return {
			ctor: '_Tuple2',
			_0: func(_p3._0),
			_1: _p3._1
		};
	});
var _elm_lang$core$Tuple$second = function (_p4) {
	var _p5 = _p4;
	return _p5._1;
};
var _elm_lang$core$Tuple$first = function (_p6) {
	var _p7 = _p6;
	return _p7._0;
};

//import //

var _elm_lang$core$Native_Platform = function() {


// PROGRAMS

function program(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flags !== 'undefined')
				{
					throw new Error(
						'The `' + moduleName + '` module does not need flags.\n'
						+ 'Call ' + moduleName + '.worker() with no arguments and you should be all set!'
					);
				}

				return initialize(
					impl.init,
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function programWithFlags(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flagDecoder === 'undefined')
				{
					throw new Error(
						'Are you trying to sneak a Never value into Elm? Trickster!\n'
						+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
						+ 'Use `program` instead if you do not want flags.'
					);
				}

				var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
				if (result.ctor === 'Err')
				{
					throw new Error(
						moduleName + '.worker(...) was called with an unexpected argument.\n'
						+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
						+ result._0
					);
				}

				return initialize(
					impl.init(result._0),
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function renderer(enqueue, _)
{
	return function(_) {};
}


// HTML TO PROGRAM

function htmlToProgram(vnode)
{
	var emptyBag = batch(_elm_lang$core$Native_List.Nil);
	var noChange = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		emptyBag
	);

	return _elm_lang$virtual_dom$VirtualDom$program({
		init: noChange,
		view: function(model) { return main; },
		update: F2(function(msg, model) { return noChange; }),
		subscriptions: function (model) { return emptyBag; }
	});
}


// INITIALIZE A PROGRAM

function initialize(init, update, subscriptions, renderer)
{
	// ambient state
	var managers = {};
	var updateView;

	// init and update state in main process
	var initApp = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
		var model = init._0;
		updateView = renderer(enqueue, model);
		var cmds = init._1;
		var subs = subscriptions(model);
		dispatchEffects(managers, cmds, subs);
		callback(_elm_lang$core$Native_Scheduler.succeed(model));
	});

	function onMessage(msg, model)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
			var results = A2(update, msg, model);
			model = results._0;
			updateView(model);
			var cmds = results._1;
			var subs = subscriptions(model);
			dispatchEffects(managers, cmds, subs);
			callback(_elm_lang$core$Native_Scheduler.succeed(model));
		});
	}

	var mainProcess = spawnLoop(initApp, onMessage);

	function enqueue(msg)
	{
		_elm_lang$core$Native_Scheduler.rawSend(mainProcess, msg);
	}

	var ports = setupEffects(managers, enqueue);

	return ports ? { ports: ports } : {};
}


// EFFECT MANAGERS

var effectManagers = {};

function setupEffects(managers, callback)
{
	var ports;

	// setup all necessary effect managers
	for (var key in effectManagers)
	{
		var manager = effectManagers[key];

		if (manager.isForeign)
		{
			ports = ports || {};
			ports[key] = manager.tag === 'cmd'
				? setupOutgoingPort(key)
				: setupIncomingPort(key, callback);
		}

		managers[key] = makeManager(manager, callback);
	}

	return ports;
}

function makeManager(info, callback)
{
	var router = {
		main: callback,
		self: undefined
	};

	var tag = info.tag;
	var onEffects = info.onEffects;
	var onSelfMsg = info.onSelfMsg;

	function onMessage(msg, state)
	{
		if (msg.ctor === 'self')
		{
			return A3(onSelfMsg, router, msg._0, state);
		}

		var fx = msg._0;
		switch (tag)
		{
			case 'cmd':
				return A3(onEffects, router, fx.cmds, state);

			case 'sub':
				return A3(onEffects, router, fx.subs, state);

			case 'fx':
				return A4(onEffects, router, fx.cmds, fx.subs, state);
		}
	}

	var process = spawnLoop(info.init, onMessage);
	router.self = process;
	return process;
}

function sendToApp(router, msg)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		router.main(msg);
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sendToSelf(router, msg)
{
	return A2(_elm_lang$core$Native_Scheduler.send, router.self, {
		ctor: 'self',
		_0: msg
	});
}


// HELPER for STATEFUL LOOPS

function spawnLoop(init, onMessage)
{
	var andThen = _elm_lang$core$Native_Scheduler.andThen;

	function loop(state)
	{
		var handleMsg = _elm_lang$core$Native_Scheduler.receive(function(msg) {
			return onMessage(msg, state);
		});
		return A2(andThen, loop, handleMsg);
	}

	var task = A2(andThen, loop, init);

	return _elm_lang$core$Native_Scheduler.rawSpawn(task);
}


// BAGS

function leaf(home)
{
	return function(value)
	{
		return {
			type: 'leaf',
			home: home,
			value: value
		};
	};
}

function batch(list)
{
	return {
		type: 'node',
		branches: list
	};
}

function map(tagger, bag)
{
	return {
		type: 'map',
		tagger: tagger,
		tree: bag
	}
}


// PIPE BAGS INTO EFFECT MANAGERS

function dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	gatherEffects(true, cmdBag, effectsDict, null);
	gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		var fx = home in effectsDict
			? effectsDict[home]
			: {
				cmds: _elm_lang$core$Native_List.Nil,
				subs: _elm_lang$core$Native_List.Nil
			};

		_elm_lang$core$Native_Scheduler.rawSend(managers[home], { ctor: 'fx', _0: fx });
	}
}

function gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.type)
	{
		case 'leaf':
			var home = bag.home;
			var effect = toEffect(isCmd, home, taggers, bag.value);
			effectsDict[home] = insert(isCmd, effect, effectsDict[home]);
			return;

		case 'node':
			var list = bag.branches;
			while (list.ctor !== '[]')
			{
				gatherEffects(isCmd, list._0, effectsDict, taggers);
				list = list._1;
			}
			return;

		case 'map':
			gatherEffects(isCmd, bag.tree, effectsDict, {
				tagger: bag.tagger,
				rest: taggers
			});
			return;
	}
}

function toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		var temp = taggers;
		while (temp)
		{
			x = temp.tagger(x);
			temp = temp.rest;
		}
		return x;
	}

	var map = isCmd
		? effectManagers[home].cmdMap
		: effectManagers[home].subMap;

	return A2(map, applyTaggers, value)
}

function insert(isCmd, newEffect, effects)
{
	effects = effects || {
		cmds: _elm_lang$core$Native_List.Nil,
		subs: _elm_lang$core$Native_List.Nil
	};
	if (isCmd)
	{
		effects.cmds = _elm_lang$core$Native_List.Cons(newEffect, effects.cmds);
		return effects;
	}
	effects.subs = _elm_lang$core$Native_List.Cons(newEffect, effects.subs);
	return effects;
}


// PORTS

function checkPortName(name)
{
	if (name in effectManagers)
	{
		throw new Error('There can only be one port named `' + name + '`, but your program has multiple.');
	}
}


// OUTGOING PORTS

function outgoingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'cmd',
		cmdMap: outgoingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var outgoingPortMap = F2(function cmdMap(tagger, value) {
	return value;
});

function setupOutgoingPort(name)
{
	var subs = [];
	var converter = effectManagers[name].converter;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function onEffects(router, cmdList, state)
	{
		while (cmdList.ctor !== '[]')
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = converter(cmdList._0);
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
			cmdList = cmdList._1;
		}
		return init;
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}


// INCOMING PORTS

function incomingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'sub',
		subMap: incomingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var incomingPortMap = F2(function subMap(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});

function setupIncomingPort(name, callback)
{
	var sentBeforeInit = [];
	var subs = _elm_lang$core$Native_List.Nil;
	var converter = effectManagers[name].converter;
	var currentOnEffects = preInitOnEffects;
	var currentSend = preInitSend;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function preInitOnEffects(router, subList, state)
	{
		var postInitResult = postInitOnEffects(router, subList, state);

		for(var i = 0; i < sentBeforeInit.length; i++)
		{
			postInitSend(sentBeforeInit[i]);
		}

		sentBeforeInit = null; // to release objects held in queue
		currentSend = postInitSend;
		currentOnEffects = postInitOnEffects;
		return postInitResult;
	}

	function postInitOnEffects(router, subList, state)
	{
		subs = subList;
		return init;
	}

	function onEffects(router, subList, state)
	{
		return currentOnEffects(router, subList, state);
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function preInitSend(value)
	{
		sentBeforeInit.push(value);
	}

	function postInitSend(value)
	{
		var temp = subs;
		while (temp.ctor !== '[]')
		{
			callback(temp._0(value));
			temp = temp._1;
		}
	}

	function send(incomingValue)
	{
		var result = A2(_elm_lang$core$Json_Decode$decodeValue, converter, incomingValue);
		if (result.ctor === 'Err')
		{
			throw new Error('Trying to send an unexpected type of value through port `' + name + '`:\n' + result._0);
		}

		currentSend(result._0);
	}

	return { send: send };
}

return {
	// routers
	sendToApp: F2(sendToApp),
	sendToSelf: F2(sendToSelf),

	// global setup
	effectManagers: effectManagers,
	outgoingPort: outgoingPort,
	incomingPort: incomingPort,

	htmlToProgram: htmlToProgram,
	program: program,
	programWithFlags: programWithFlags,
	initialize: initialize,

	// effect bags
	leaf: leaf,
	batch: batch,
	map: F2(map)
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Scheduler = function() {

var MAX_STEPS = 10000;


// TASKS

function succeed(value)
{
	return {
		ctor: '_Task_succeed',
		value: value
	};
}

function fail(error)
{
	return {
		ctor: '_Task_fail',
		value: error
	};
}

function nativeBinding(callback)
{
	return {
		ctor: '_Task_nativeBinding',
		callback: callback,
		cancel: null
	};
}

function andThen(callback, task)
{
	return {
		ctor: '_Task_andThen',
		callback: callback,
		task: task
	};
}

function onError(callback, task)
{
	return {
		ctor: '_Task_onError',
		callback: callback,
		task: task
	};
}

function receive(callback)
{
	return {
		ctor: '_Task_receive',
		callback: callback
	};
}


// PROCESSES

function rawSpawn(task)
{
	var process = {
		ctor: '_Process',
		id: _elm_lang$core$Native_Utils.guid(),
		root: task,
		stack: null,
		mailbox: []
	};

	enqueue(process);

	return process;
}

function spawn(task)
{
	return nativeBinding(function(callback) {
		var process = rawSpawn(task);
		callback(succeed(process));
	});
}

function rawSend(process, msg)
{
	process.mailbox.push(msg);
	enqueue(process);
}

function send(process, msg)
{
	return nativeBinding(function(callback) {
		rawSend(process, msg);
		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function kill(process)
{
	return nativeBinding(function(callback) {
		var root = process.root;
		if (root.ctor === '_Task_nativeBinding' && root.cancel)
		{
			root.cancel();
		}

		process.root = null;

		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sleep(time)
{
	return nativeBinding(function(callback) {
		var id = setTimeout(function() {
			callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}


// STEP PROCESSES

function step(numSteps, process)
{
	while (numSteps < MAX_STEPS)
	{
		var ctor = process.root.ctor;

		if (ctor === '_Task_succeed')
		{
			while (process.stack && process.stack.ctor === '_Task_onError')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_fail')
		{
			while (process.stack && process.stack.ctor === '_Task_andThen')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_andThen')
		{
			process.stack = {
				ctor: '_Task_andThen',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_onError')
		{
			process.stack = {
				ctor: '_Task_onError',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_nativeBinding')
		{
			process.root.cancel = process.root.callback(function(newRoot) {
				process.root = newRoot;
				enqueue(process);
			});

			break;
		}

		if (ctor === '_Task_receive')
		{
			var mailbox = process.mailbox;
			if (mailbox.length === 0)
			{
				break;
			}

			process.root = process.root.callback(mailbox.shift());
			++numSteps;
			continue;
		}

		throw new Error(ctor);
	}

	if (numSteps < MAX_STEPS)
	{
		return numSteps + 1;
	}
	enqueue(process);

	return numSteps;
}


// WORK QUEUE

var working = false;
var workQueue = [];

function enqueue(process)
{
	workQueue.push(process);

	if (!working)
	{
		setTimeout(work, 0);
		working = true;
	}
}

function work()
{
	var numSteps = 0;
	var process;
	while (numSteps < MAX_STEPS && (process = workQueue.shift()))
	{
		if (process.root)
		{
			numSteps = step(numSteps, process);
		}
	}
	if (!process)
	{
		working = false;
		return;
	}
	setTimeout(work, 0);
}


return {
	succeed: succeed,
	fail: fail,
	nativeBinding: nativeBinding,
	andThen: F2(andThen),
	onError: F2(onError),
	receive: receive,

	spawn: spawn,
	kill: kill,
	sleep: sleep,
	send: F2(send),

	rawSpawn: rawSpawn,
	rawSend: rawSend
};

}();
var _elm_lang$core$Platform_Cmd$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Cmd$none = _elm_lang$core$Platform_Cmd$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Cmd_ops = _elm_lang$core$Platform_Cmd_ops || {};
_elm_lang$core$Platform_Cmd_ops['!'] = F2(
	function (model, commands) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _elm_lang$core$Platform_Cmd$batch(commands)
		};
	});
var _elm_lang$core$Platform_Cmd$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Cmd$Cmd = {ctor: 'Cmd'};

var _elm_lang$core$Platform_Sub$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Sub$none = _elm_lang$core$Platform_Sub$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Sub$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Sub$Sub = {ctor: 'Sub'};

var _elm_lang$core$Platform$hack = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Platform$sendToSelf = _elm_lang$core$Native_Platform.sendToSelf;
var _elm_lang$core$Platform$sendToApp = _elm_lang$core$Native_Platform.sendToApp;
var _elm_lang$core$Platform$programWithFlags = _elm_lang$core$Native_Platform.programWithFlags;
var _elm_lang$core$Platform$program = _elm_lang$core$Native_Platform.program;
var _elm_lang$core$Platform$Program = {ctor: 'Program'};
var _elm_lang$core$Platform$Task = {ctor: 'Task'};
var _elm_lang$core$Platform$ProcessId = {ctor: 'ProcessId'};
var _elm_lang$core$Platform$Router = {ctor: 'Router'};

var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode = _elm_lang$core$Json_Decode$succeed;
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$resolve = _elm_lang$core$Json_Decode$andThen(_elm_lang$core$Basics$identity);
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom = F2(
	function (decoder, wrapped) {
		return A3(
			_elm_lang$core$Json_Decode$map2,
			F2(
				function (x, y) {
					return x(y);
				}),
			wrapped,
			decoder);
	});
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$hardcoded = function (_p0) {
	return _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom(
		_elm_lang$core$Json_Decode$succeed(_p0));
};
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optionalDecoder = F3(
	function (pathDecoder, valDecoder, fallback) {
		var nullOr = function (decoder) {
			return _elm_lang$core$Json_Decode$oneOf(
				{
					ctor: '::',
					_0: decoder,
					_1: {
						ctor: '::',
						_0: _elm_lang$core$Json_Decode$null(fallback),
						_1: {ctor: '[]'}
					}
				});
		};
		var handleResult = function (input) {
			var _p1 = A2(_elm_lang$core$Json_Decode$decodeValue, pathDecoder, input);
			if (_p1.ctor === 'Ok') {
				var _p2 = A2(
					_elm_lang$core$Json_Decode$decodeValue,
					nullOr(valDecoder),
					_p1._0);
				if (_p2.ctor === 'Ok') {
					return _elm_lang$core$Json_Decode$succeed(_p2._0);
				} else {
					return _elm_lang$core$Json_Decode$fail(_p2._0);
				}
			} else {
				var _p3 = A2(
					_elm_lang$core$Json_Decode$decodeValue,
					_elm_lang$core$Json_Decode$keyValuePairs(_elm_lang$core$Json_Decode$value),
					input);
				if (_p3.ctor === 'Ok') {
					return _elm_lang$core$Json_Decode$succeed(fallback);
				} else {
					return _elm_lang$core$Json_Decode$fail(_p3._0);
				}
			}
		};
		return A2(_elm_lang$core$Json_Decode$andThen, handleResult, _elm_lang$core$Json_Decode$value);
	});
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optionalAt = F4(
	function (path, valDecoder, fallback, decoder) {
		return A2(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom,
			A3(
				_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optionalDecoder,
				A2(_elm_lang$core$Json_Decode$at, path, _elm_lang$core$Json_Decode$value),
				valDecoder,
				fallback),
			decoder);
	});
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optional = F4(
	function (key, valDecoder, fallback, decoder) {
		return A2(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom,
			A3(
				_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optionalDecoder,
				A2(_elm_lang$core$Json_Decode$field, key, _elm_lang$core$Json_Decode$value),
				valDecoder,
				fallback),
			decoder);
	});
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$requiredAt = F3(
	function (path, valDecoder, decoder) {
		return A2(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom,
			A2(_elm_lang$core$Json_Decode$at, path, valDecoder),
			decoder);
	});
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required = F3(
	function (key, valDecoder, decoder) {
		return A2(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom,
			A2(_elm_lang$core$Json_Decode$field, key, valDecoder),
			decoder);
	});

var _elm_lang$virtual_dom$VirtualDom_Debug$wrap;
var _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags;

var _elm_lang$virtual_dom$Native_VirtualDom = function() {

var STYLE_KEY = 'STYLE';
var EVENT_KEY = 'EVENT';
var ATTR_KEY = 'ATTR';
var ATTR_NS_KEY = 'ATTR_NS';

var localDoc = typeof document !== 'undefined' ? document : {};


////////////  VIRTUAL DOM NODES  ////////////


function text(string)
{
	return {
		type: 'text',
		text: string
	};
}


function node(tag)
{
	return F2(function(factList, kidList) {
		return nodeHelp(tag, factList, kidList);
	});
}


function nodeHelp(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function keyedNode(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid._1.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'keyed-node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function custom(factList, model, impl)
{
	var facts = organizeFacts(factList).facts;

	return {
		type: 'custom',
		facts: facts,
		model: model,
		impl: impl
	};
}


function map(tagger, node)
{
	return {
		type: 'tagger',
		tagger: tagger,
		node: node,
		descendantsCount: 1 + (node.descendantsCount || 0)
	};
}


function thunk(func, args, thunk)
{
	return {
		type: 'thunk',
		func: func,
		args: args,
		thunk: thunk,
		node: undefined
	};
}

function lazy(fn, a)
{
	return thunk(fn, [a], function() {
		return fn(a);
	});
}

function lazy2(fn, a, b)
{
	return thunk(fn, [a,b], function() {
		return A2(fn, a, b);
	});
}

function lazy3(fn, a, b, c)
{
	return thunk(fn, [a,b,c], function() {
		return A3(fn, a, b, c);
	});
}



// FACTS


function organizeFacts(factList)
{
	var namespace, facts = {};

	while (factList.ctor !== '[]')
	{
		var entry = factList._0;
		var key = entry.key;

		if (key === ATTR_KEY || key === ATTR_NS_KEY || key === EVENT_KEY)
		{
			var subFacts = facts[key] || {};
			subFacts[entry.realKey] = entry.value;
			facts[key] = subFacts;
		}
		else if (key === STYLE_KEY)
		{
			var styles = facts[key] || {};
			var styleList = entry.value;
			while (styleList.ctor !== '[]')
			{
				var style = styleList._0;
				styles[style._0] = style._1;
				styleList = styleList._1;
			}
			facts[key] = styles;
		}
		else if (key === 'namespace')
		{
			namespace = entry.value;
		}
		else if (key === 'className')
		{
			var classes = facts[key];
			facts[key] = typeof classes === 'undefined'
				? entry.value
				: classes + ' ' + entry.value;
		}
 		else
		{
			facts[key] = entry.value;
		}
		factList = factList._1;
	}

	return {
		facts: facts,
		namespace: namespace
	};
}



////////////  PROPERTIES AND ATTRIBUTES  ////////////


function style(value)
{
	return {
		key: STYLE_KEY,
		value: value
	};
}


function property(key, value)
{
	return {
		key: key,
		value: value
	};
}


function attribute(key, value)
{
	return {
		key: ATTR_KEY,
		realKey: key,
		value: value
	};
}


function attributeNS(namespace, key, value)
{
	return {
		key: ATTR_NS_KEY,
		realKey: key,
		value: {
			value: value,
			namespace: namespace
		}
	};
}


function on(name, options, decoder)
{
	return {
		key: EVENT_KEY,
		realKey: name,
		value: {
			options: options,
			decoder: decoder
		}
	};
}


function equalEvents(a, b)
{
	if (a.options !== b.options)
	{
		if (a.options.stopPropagation !== b.options.stopPropagation || a.options.preventDefault !== b.options.preventDefault)
		{
			return false;
		}
	}
	return _elm_lang$core$Native_Json.equality(a.decoder, b.decoder);
}


function mapProperty(func, property)
{
	if (property.key !== EVENT_KEY)
	{
		return property;
	}
	return on(
		property.realKey,
		property.value.options,
		A2(_elm_lang$core$Json_Decode$map, func, property.value.decoder)
	);
}


////////////  RENDER  ////////////


function render(vNode, eventNode)
{
	switch (vNode.type)
	{
		case 'thunk':
			if (!vNode.node)
			{
				vNode.node = vNode.thunk();
			}
			return render(vNode.node, eventNode);

		case 'tagger':
			var subNode = vNode.node;
			var tagger = vNode.tagger;

			while (subNode.type === 'tagger')
			{
				typeof tagger !== 'object'
					? tagger = [tagger, subNode.tagger]
					: tagger.push(subNode.tagger);

				subNode = subNode.node;
			}

			var subEventRoot = { tagger: tagger, parent: eventNode };
			var domNode = render(subNode, subEventRoot);
			domNode.elm_event_node_ref = subEventRoot;
			return domNode;

		case 'text':
			return localDoc.createTextNode(vNode.text);

		case 'node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i], eventNode));
			}

			return domNode;

		case 'keyed-node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i]._1, eventNode));
			}

			return domNode;

		case 'custom':
			var domNode = vNode.impl.render(vNode.model);
			applyFacts(domNode, eventNode, vNode.facts);
			return domNode;
	}
}



////////////  APPLY FACTS  ////////////


function applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		switch (key)
		{
			case STYLE_KEY:
				applyStyles(domNode, value);
				break;

			case EVENT_KEY:
				applyEvents(domNode, eventNode, value);
				break;

			case ATTR_KEY:
				applyAttrs(domNode, value);
				break;

			case ATTR_NS_KEY:
				applyAttrsNS(domNode, value);
				break;

			case 'value':
				if (domNode[key] !== value)
				{
					domNode[key] = value;
				}
				break;

			default:
				domNode[key] = value;
				break;
		}
	}
}

function applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}

function applyEvents(domNode, eventNode, events)
{
	var allHandlers = domNode.elm_handlers || {};

	for (var key in events)
	{
		var handler = allHandlers[key];
		var value = events[key];

		if (typeof value === 'undefined')
		{
			domNode.removeEventListener(key, handler);
			allHandlers[key] = undefined;
		}
		else if (typeof handler === 'undefined')
		{
			var handler = makeEventHandler(eventNode, value);
			domNode.addEventListener(key, handler);
			allHandlers[key] = handler;
		}
		else
		{
			handler.info = value;
		}
	}

	domNode.elm_handlers = allHandlers;
}

function makeEventHandler(eventNode, info)
{
	function eventHandler(event)
	{
		var info = eventHandler.info;

		var value = A2(_elm_lang$core$Native_Json.run, info.decoder, event);

		if (value.ctor === 'Ok')
		{
			var options = info.options;
			if (options.stopPropagation)
			{
				event.stopPropagation();
			}
			if (options.preventDefault)
			{
				event.preventDefault();
			}

			var message = value._0;

			var currentEventNode = eventNode;
			while (currentEventNode)
			{
				var tagger = currentEventNode.tagger;
				if (typeof tagger === 'function')
				{
					message = tagger(message);
				}
				else
				{
					for (var i = tagger.length; i--; )
					{
						message = tagger[i](message);
					}
				}
				currentEventNode = currentEventNode.parent;
			}
		}
	};

	eventHandler.info = info;

	return eventHandler;
}

function applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		if (typeof value === 'undefined')
		{
			domNode.removeAttribute(key);
		}
		else
		{
			domNode.setAttribute(key, value);
		}
	}
}

function applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.namespace;
		var value = pair.value;

		if (typeof value === 'undefined')
		{
			domNode.removeAttributeNS(namespace, key);
		}
		else
		{
			domNode.setAttributeNS(namespace, key, value);
		}
	}
}



////////////  DIFF  ////////////


function diff(a, b)
{
	var patches = [];
	diffHelp(a, b, patches, 0);
	return patches;
}


function makePatch(type, index, data)
{
	return {
		index: index,
		type: type,
		data: data,
		domNode: undefined,
		eventNode: undefined
	};
}


function diffHelp(a, b, patches, index)
{
	if (a === b)
	{
		return;
	}

	var aType = a.type;
	var bType = b.type;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (aType !== bType)
	{
		patches.push(makePatch('p-redraw', index, b));
		return;
	}

	// Now we know that both nodes are the same type.
	switch (bType)
	{
		case 'thunk':
			var aArgs = a.args;
			var bArgs = b.args;
			var i = aArgs.length;
			var same = a.func === b.func && i === bArgs.length;
			while (same && i--)
			{
				same = aArgs[i] === bArgs[i];
			}
			if (same)
			{
				b.node = a.node;
				return;
			}
			b.node = b.thunk();
			var subPatches = [];
			diffHelp(a.node, b.node, subPatches, 0);
			if (subPatches.length > 0)
			{
				patches.push(makePatch('p-thunk', index, subPatches));
			}
			return;

		case 'tagger':
			// gather nested taggers
			var aTaggers = a.tagger;
			var bTaggers = b.tagger;
			var nesting = false;

			var aSubNode = a.node;
			while (aSubNode.type === 'tagger')
			{
				nesting = true;

				typeof aTaggers !== 'object'
					? aTaggers = [aTaggers, aSubNode.tagger]
					: aTaggers.push(aSubNode.tagger);

				aSubNode = aSubNode.node;
			}

			var bSubNode = b.node;
			while (bSubNode.type === 'tagger')
			{
				nesting = true;

				typeof bTaggers !== 'object'
					? bTaggers = [bTaggers, bSubNode.tagger]
					: bTaggers.push(bSubNode.tagger);

				bSubNode = bSubNode.node;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && aTaggers.length !== bTaggers.length)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !pairwiseRefEqual(aTaggers, bTaggers) : aTaggers !== bTaggers)
			{
				patches.push(makePatch('p-tagger', index, bTaggers));
			}

			// diff everything below the taggers
			diffHelp(aSubNode, bSubNode, patches, index + 1);
			return;

		case 'text':
			if (a.text !== b.text)
			{
				patches.push(makePatch('p-text', index, b.text));
				return;
			}

			return;

		case 'node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffChildren(a, b, patches, index);
			return;

		case 'keyed-node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffKeyedChildren(a, b, patches, index);
			return;

		case 'custom':
			if (a.impl !== b.impl)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);
			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			var patch = b.impl.diff(a,b);
			if (patch)
			{
				patches.push(makePatch('p-custom', index, patch));
				return;
			}

			return;
	}
}


// assumes the incoming arrays are the same length
function pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function diffFacts(a, b, category)
{
	var diff;

	// look for changes and removals
	for (var aKey in a)
	{
		if (aKey === STYLE_KEY || aKey === EVENT_KEY || aKey === ATTR_KEY || aKey === ATTR_NS_KEY)
		{
			var subDiff = diffFacts(a[aKey], b[aKey] || {}, aKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[aKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(aKey in b))
		{
			diff = diff || {};
			diff[aKey] =
				(typeof category === 'undefined')
					? (typeof a[aKey] === 'string' ? '' : null)
					:
				(category === STYLE_KEY)
					? ''
					:
				(category === EVENT_KEY || category === ATTR_KEY)
					? undefined
					:
				{ namespace: a[aKey].namespace, value: undefined };

			continue;
		}

		var aValue = a[aKey];
		var bValue = b[aKey];

		// reference equal, so don't worry about it
		if (aValue === bValue && aKey !== 'value'
			|| category === EVENT_KEY && equalEvents(aValue, bValue))
		{
			continue;
		}

		diff = diff || {};
		diff[aKey] = bValue;
	}

	// add new stuff
	for (var bKey in b)
	{
		if (!(bKey in a))
		{
			diff = diff || {};
			diff[bKey] = b[bKey];
		}
	}

	return diff;
}


function diffChildren(aParent, bParent, patches, rootIndex)
{
	var aChildren = aParent.children;
	var bChildren = bParent.children;

	var aLen = aChildren.length;
	var bLen = bChildren.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (aLen > bLen)
	{
		patches.push(makePatch('p-remove-last', rootIndex, aLen - bLen));
	}
	else if (aLen < bLen)
	{
		patches.push(makePatch('p-append', rootIndex, bChildren.slice(aLen)));
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	var index = rootIndex;
	var minLen = aLen < bLen ? aLen : bLen;
	for (var i = 0; i < minLen; i++)
	{
		index++;
		var aChild = aChildren[i];
		diffHelp(aChild, bChildren[i], patches, index);
		index += aChild.descendantsCount || 0;
	}
}



////////////  KEYED DIFF  ////////////


function diffKeyedChildren(aParent, bParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var aChildren = aParent.children;
	var bChildren = bParent.children;
	var aLen = aChildren.length;
	var bLen = bChildren.length;
	var aIndex = 0;
	var bIndex = 0;

	var index = rootIndex;

	while (aIndex < aLen && bIndex < bLen)
	{
		var a = aChildren[aIndex];
		var b = bChildren[bIndex];

		var aKey = a._0;
		var bKey = b._0;
		var aNode = a._1;
		var bNode = b._1;

		// check if keys match

		if (aKey === bKey)
		{
			index++;
			diffHelp(aNode, bNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex++;
			bIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var aLookAhead = aIndex + 1 < aLen;
		var bLookAhead = bIndex + 1 < bLen;

		if (aLookAhead)
		{
			var aNext = aChildren[aIndex + 1];
			var aNextKey = aNext._0;
			var aNextNode = aNext._1;
			var oldMatch = bKey === aNextKey;
		}

		if (bLookAhead)
		{
			var bNext = bChildren[bIndex + 1];
			var bNextKey = bNext._0;
			var bNextNode = bNext._1;
			var newMatch = aKey === bNextKey;
		}


		// swap a and b
		if (aLookAhead && bLookAhead && newMatch && oldMatch)
		{
			index++;
			diffHelp(aNode, bNextNode, localPatches, index);
			insertNode(changes, localPatches, aKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			removeNode(changes, localPatches, aKey, aNextNode, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		// insert b
		if (bLookAhead && newMatch)
		{
			index++;
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			diffHelp(aNode, bNextNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex += 1;
			bIndex += 2;
			continue;
		}

		// remove a
		if (aLookAhead && oldMatch)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 1;
			continue;
		}

		// remove a, insert b
		if (aLookAhead && bLookAhead && aNextKey === bNextKey)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNextNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (aIndex < aLen)
	{
		index++;
		var a = aChildren[aIndex];
		var aNode = a._1;
		removeNode(changes, localPatches, a._0, aNode, index);
		index += aNode.descendantsCount || 0;
		aIndex++;
	}

	var endInserts;
	while (bIndex < bLen)
	{
		endInserts = endInserts || [];
		var b = bChildren[bIndex];
		insertNode(changes, localPatches, b._0, b._1, undefined, endInserts);
		bIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || typeof endInserts !== 'undefined')
	{
		patches.push(makePatch('p-reorder', rootIndex, {
			patches: localPatches,
			inserts: inserts,
			endInserts: endInserts
		}));
	}
}



////////////  CHANGES FROM KEYED DIFF  ////////////


var POSTFIX = '_elmW6BL';


function insertNode(changes, localPatches, key, vnode, bIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		entry = {
			tag: 'insert',
			vnode: vnode,
			index: bIndex,
			data: undefined
		};

		inserts.push({ index: bIndex, entry: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.tag === 'remove')
	{
		inserts.push({ index: bIndex, entry: entry });

		entry.tag = 'move';
		var subPatches = [];
		diffHelp(entry.vnode, vnode, subPatches, entry.index);
		entry.index = bIndex;
		entry.data.data = {
			patches: subPatches,
			entry: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	insertNode(changes, localPatches, key + POSTFIX, vnode, bIndex, inserts);
}


function removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		var patch = makePatch('p-remove', index, undefined);
		localPatches.push(patch);

		changes[key] = {
			tag: 'remove',
			vnode: vnode,
			index: index,
			data: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.tag === 'insert')
	{
		entry.tag = 'move';
		var subPatches = [];
		diffHelp(vnode, entry.vnode, subPatches, index);

		var patch = makePatch('p-remove', index, {
			patches: subPatches,
			entry: entry
		});
		localPatches.push(patch);

		return;
	}

	// this key has already been removed or moved, a duplicate!
	removeNode(changes, localPatches, key + POSTFIX, vnode, index);
}



////////////  ADD DOM NODES  ////////////
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function addDomNodes(domNode, vNode, patches, eventNode)
{
	addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.descendantsCount, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.index;

	while (index === low)
	{
		var patchType = patch.type;

		if (patchType === 'p-thunk')
		{
			addDomNodes(domNode, vNode.node, patch.data, eventNode);
		}
		else if (patchType === 'p-reorder')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var subPatches = patch.data.patches;
			if (subPatches.length > 0)
			{
				addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 'p-remove')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var data = patch.data;
			if (typeof data !== 'undefined')
			{
				data.entry.data = domNode;
				var subPatches = data.patches;
				if (subPatches.length > 0)
				{
					addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.index) > high)
		{
			return i;
		}
	}

	switch (vNode.type)
	{
		case 'tagger':
			var subNode = vNode.node;

			while (subNode.type === "tagger")
			{
				subNode = subNode.node;
			}

			return addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);

		case 'node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j];
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'keyed-node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j]._1;
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'text':
		case 'thunk':
			throw new Error('should never traverse `text` or `thunk` nodes like this');
	}
}



////////////  APPLY PATCHES  ////////////


function applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return applyPatchesHelp(rootDomNode, patches);
}

function applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.domNode
		var newNode = applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function applyPatch(domNode, patch)
{
	switch (patch.type)
	{
		case 'p-redraw':
			return applyPatchRedraw(domNode, patch.data, patch.eventNode);

		case 'p-facts':
			applyFacts(domNode, patch.eventNode, patch.data);
			return domNode;

		case 'p-text':
			domNode.replaceData(0, domNode.length, patch.data);
			return domNode;

		case 'p-thunk':
			return applyPatchesHelp(domNode, patch.data);

		case 'p-tagger':
			if (typeof domNode.elm_event_node_ref !== 'undefined')
			{
				domNode.elm_event_node_ref.tagger = patch.data;
			}
			else
			{
				domNode.elm_event_node_ref = { tagger: patch.data, parent: patch.eventNode };
			}
			return domNode;

		case 'p-remove-last':
			var i = patch.data;
			while (i--)
			{
				domNode.removeChild(domNode.lastChild);
			}
			return domNode;

		case 'p-append':
			var newNodes = patch.data;
			for (var i = 0; i < newNodes.length; i++)
			{
				domNode.appendChild(render(newNodes[i], patch.eventNode));
			}
			return domNode;

		case 'p-remove':
			var data = patch.data;
			if (typeof data === 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.entry;
			if (typeof entry.index !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.data = applyPatchesHelp(domNode, data.patches);
			return domNode;

		case 'p-reorder':
			return applyPatchReorder(domNode, patch);

		case 'p-custom':
			var impl = patch.data;
			return impl.applyPatch(domNode, impl.data);

		default:
			throw new Error('Ran into an unknown patch!');
	}
}


function applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = render(vNode, eventNode);

	if (typeof newNode.elm_event_node_ref === 'undefined')
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function applyPatchReorder(domNode, patch)
{
	var data = patch.data;

	// remove end inserts
	var frag = applyPatchReorderEndInsertsHelp(data.endInserts, patch);

	// removals
	domNode = applyPatchesHelp(domNode, data.patches);

	// inserts
	var inserts = data.inserts;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.entry;
		var node = entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode);
		domNode.insertBefore(node, domNode.childNodes[insert.index]);
	}

	// add end inserts
	if (typeof frag !== 'undefined')
	{
		domNode.appendChild(frag);
	}

	return domNode;
}


function applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (typeof endInserts === 'undefined')
	{
		return;
	}

	var frag = localDoc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.entry;
		frag.appendChild(entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode)
		);
	}
	return frag;
}


// PROGRAMS

var program = makeProgram(checkNoFlags);
var programWithFlags = makeProgram(checkYesFlags);

function makeProgram(flagChecker)
{
	return F2(function(debugWrap, impl)
	{
		return function(flagDecoder)
		{
			return function(object, moduleName, debugMetadata)
			{
				var checker = flagChecker(flagDecoder, moduleName);
				if (typeof debugMetadata === 'undefined')
				{
					normalSetup(impl, object, moduleName, checker);
				}
				else
				{
					debugSetup(A2(debugWrap, debugMetadata, impl), object, moduleName, checker);
				}
			};
		};
	});
}

function staticProgram(vNode)
{
	var nothing = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		_elm_lang$core$Platform_Cmd$none
	);
	return A2(program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, {
		init: nothing,
		view: function() { return vNode; },
		update: F2(function() { return nothing; }),
		subscriptions: function() { return _elm_lang$core$Platform_Sub$none; }
	})();
}


// FLAG CHECKERS

function checkNoFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flags === 'undefined')
		{
			return init;
		}

		var errorMessage =
			'The `' + moduleName + '` module does not need flags.\n'
			+ 'Initialize it with no arguments and you should be all set!';

		crash(errorMessage, domNode);
	};
}

function checkYesFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flagDecoder === 'undefined')
		{
			var errorMessage =
				'Are you trying to sneak a Never value into Elm? Trickster!\n'
				+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
				+ 'Use `program` instead if you do not want flags.'

			crash(errorMessage, domNode);
		}

		var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
		if (result.ctor === 'Ok')
		{
			return init(result._0);
		}

		var errorMessage =
			'Trying to initialize the `' + moduleName + '` module with an unexpected flag.\n'
			+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
			+ result._0;

		crash(errorMessage, domNode);
	};
}

function crash(errorMessage, domNode)
{
	if (domNode)
	{
		domNode.innerHTML =
			'<div style="padding-left:1em;">'
			+ '<h2 style="font-weight:normal;"><b>Oops!</b> Something went wrong when starting your Elm program.</h2>'
			+ '<pre style="padding-left:1em;">' + errorMessage + '</pre>'
			+ '</div>';
	}

	throw new Error(errorMessage);
}


//  NORMAL SETUP

function normalSetup(impl, object, moduleName, flagChecker)
{
	object['embed'] = function embed(node, flags)
	{
		while (node.lastChild)
		{
			node.removeChild(node.lastChild);
		}

		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update,
			impl.subscriptions,
			normalRenderer(node, impl.view)
		);
	};

	object['fullscreen'] = function fullscreen(flags)
	{
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update,
			impl.subscriptions,
			normalRenderer(document.body, impl.view)
		);
	};
}

function normalRenderer(parentNode, view)
{
	return function(tagger, initialModel)
	{
		var eventNode = { tagger: tagger, parent: undefined };
		var initialVirtualNode = view(initialModel);
		var domNode = render(initialVirtualNode, eventNode);
		parentNode.appendChild(domNode);
		return makeStepper(domNode, view, initialVirtualNode, eventNode);
	};
}


// STEPPER

var rAF =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { setTimeout(callback, 1000 / 60); };

function makeStepper(domNode, view, initialVirtualNode, eventNode)
{
	var state = 'NO_REQUEST';
	var currNode = initialVirtualNode;
	var nextModel;

	function updateIfNeeded()
	{
		switch (state)
		{
			case 'NO_REQUEST':
				throw new Error(
					'Unexpected draw callback.\n' +
					'Please report this to <https://github.com/elm-lang/virtual-dom/issues>.'
				);

			case 'PENDING_REQUEST':
				rAF(updateIfNeeded);
				state = 'EXTRA_REQUEST';

				var nextNode = view(nextModel);
				var patches = diff(currNode, nextNode);
				domNode = applyPatches(domNode, currNode, patches, eventNode);
				currNode = nextNode;

				return;

			case 'EXTRA_REQUEST':
				state = 'NO_REQUEST';
				return;
		}
	}

	return function stepper(model)
	{
		if (state === 'NO_REQUEST')
		{
			rAF(updateIfNeeded);
		}
		state = 'PENDING_REQUEST';
		nextModel = model;
	};
}


// DEBUG SETUP

function debugSetup(impl, object, moduleName, flagChecker)
{
	object['fullscreen'] = function fullscreen(flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, document.body, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};

	object['embed'] = function fullscreen(node, flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, node, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};
}

function scrollTask(popoutRef)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var doc = popoutRef.doc;
		if (doc)
		{
			var msgs = doc.getElementsByClassName('debugger-sidebar-messages')[0];
			if (msgs)
			{
				msgs.scrollTop = msgs.scrollHeight;
			}
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}


function debugRenderer(moduleName, parentNode, popoutRef, view, viewIn, viewOut)
{
	return function(tagger, initialModel)
	{
		var appEventNode = { tagger: tagger, parent: undefined };
		var eventNode = { tagger: tagger, parent: undefined };

		// make normal stepper
		var appVirtualNode = view(initialModel);
		var appNode = render(appVirtualNode, appEventNode);
		parentNode.appendChild(appNode);
		var appStepper = makeStepper(appNode, view, appVirtualNode, appEventNode);

		// make overlay stepper
		var overVirtualNode = viewIn(initialModel)._1;
		var overNode = render(overVirtualNode, eventNode);
		parentNode.appendChild(overNode);
		var wrappedViewIn = wrapViewIn(appEventNode, overNode, viewIn);
		var overStepper = makeStepper(overNode, wrappedViewIn, overVirtualNode, eventNode);

		// make debugger stepper
		var debugStepper = makeDebugStepper(initialModel, viewOut, eventNode, parentNode, moduleName, popoutRef);

		return function stepper(model)
		{
			appStepper(model);
			overStepper(model);
			debugStepper(model);
		}
	};
}

function makeDebugStepper(initialModel, view, eventNode, parentNode, moduleName, popoutRef)
{
	var curr;
	var domNode;

	return function stepper(model)
	{
		if (!model.isDebuggerOpen)
		{
			return;
		}

		if (!popoutRef.doc)
		{
			curr = view(model);
			domNode = openDebugWindow(moduleName, popoutRef, curr, eventNode);
			return;
		}

		// switch to document of popout
		localDoc = popoutRef.doc;

		var next = view(model);
		var patches = diff(curr, next);
		domNode = applyPatches(domNode, curr, patches, eventNode);
		curr = next;

		// switch back to normal document
		localDoc = document;
	};
}

function openDebugWindow(moduleName, popoutRef, virtualNode, eventNode)
{
	var w = 900;
	var h = 360;
	var x = screen.width - w;
	var y = screen.height - h;
	var debugWindow = window.open('', '', 'width=' + w + ',height=' + h + ',left=' + x + ',top=' + y);

	// switch to window document
	localDoc = debugWindow.document;

	popoutRef.doc = localDoc;
	localDoc.title = 'Debugger - ' + moduleName;
	localDoc.body.style.margin = '0';
	localDoc.body.style.padding = '0';
	var domNode = render(virtualNode, eventNode);
	localDoc.body.appendChild(domNode);

	localDoc.addEventListener('keydown', function(event) {
		if (event.metaKey && event.which === 82)
		{
			window.location.reload();
		}
		if (event.which === 38)
		{
			eventNode.tagger({ ctor: 'Up' });
			event.preventDefault();
		}
		if (event.which === 40)
		{
			eventNode.tagger({ ctor: 'Down' });
			event.preventDefault();
		}
	});

	function close()
	{
		popoutRef.doc = undefined;
		debugWindow.close();
	}
	window.addEventListener('unload', close);
	debugWindow.addEventListener('unload', function() {
		popoutRef.doc = undefined;
		window.removeEventListener('unload', close);
		eventNode.tagger({ ctor: 'Close' });
	});

	// switch back to the normal document
	localDoc = document;

	return domNode;
}


// BLOCK EVENTS

function wrapViewIn(appEventNode, overlayNode, viewIn)
{
	var ignorer = makeIgnorer(overlayNode);
	var blocking = 'Normal';
	var overflow;

	var normalTagger = appEventNode.tagger;
	var blockTagger = function() {};

	return function(model)
	{
		var tuple = viewIn(model);
		var newBlocking = tuple._0.ctor;
		appEventNode.tagger = newBlocking === 'Normal' ? normalTagger : blockTagger;
		if (blocking !== newBlocking)
		{
			traverse('removeEventListener', ignorer, blocking);
			traverse('addEventListener', ignorer, newBlocking);

			if (blocking === 'Normal')
			{
				overflow = document.body.style.overflow;
				document.body.style.overflow = 'hidden';
			}

			if (newBlocking === 'Normal')
			{
				document.body.style.overflow = overflow;
			}

			blocking = newBlocking;
		}
		return tuple._1;
	}
}

function traverse(verbEventListener, ignorer, blocking)
{
	switch(blocking)
	{
		case 'Normal':
			return;

		case 'Pause':
			return traverseHelp(verbEventListener, ignorer, mostEvents);

		case 'Message':
			return traverseHelp(verbEventListener, ignorer, allEvents);
	}
}

function traverseHelp(verbEventListener, handler, eventNames)
{
	for (var i = 0; i < eventNames.length; i++)
	{
		document.body[verbEventListener](eventNames[i], handler, true);
	}
}

function makeIgnorer(overlayNode)
{
	return function(event)
	{
		if (event.type === 'keydown' && event.metaKey && event.which === 82)
		{
			return;
		}

		var isScroll = event.type === 'scroll' || event.type === 'wheel';

		var node = event.target;
		while (node !== null)
		{
			if (node.className === 'elm-overlay-message-details' && isScroll)
			{
				return;
			}

			if (node === overlayNode && !isScroll)
			{
				return;
			}
			node = node.parentNode;
		}

		event.stopPropagation();
		event.preventDefault();
	}
}

var mostEvents = [
	'click', 'dblclick', 'mousemove',
	'mouseup', 'mousedown', 'mouseenter', 'mouseleave',
	'touchstart', 'touchend', 'touchcancel', 'touchmove',
	'pointerdown', 'pointerup', 'pointerover', 'pointerout',
	'pointerenter', 'pointerleave', 'pointermove', 'pointercancel',
	'dragstart', 'drag', 'dragend', 'dragenter', 'dragover', 'dragleave', 'drop',
	'keyup', 'keydown', 'keypress',
	'input', 'change',
	'focus', 'blur'
];

var allEvents = mostEvents.concat('wheel', 'scroll');


return {
	node: node,
	text: text,
	custom: custom,
	map: F2(map),

	on: F3(on),
	style: style,
	property: F2(property),
	attribute: F2(attribute),
	attributeNS: F3(attributeNS),
	mapProperty: F2(mapProperty),

	lazy: F2(lazy),
	lazy2: F3(lazy2),
	lazy3: F4(lazy3),
	keyedNode: F3(keyedNode),

	program: program,
	programWithFlags: programWithFlags,
	staticProgram: staticProgram
};

}();

var _elm_lang$virtual_dom$VirtualDom$programWithFlags = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.programWithFlags, _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags, impl);
};
var _elm_lang$virtual_dom$VirtualDom$program = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, impl);
};
var _elm_lang$virtual_dom$VirtualDom$keyedNode = _elm_lang$virtual_dom$Native_VirtualDom.keyedNode;
var _elm_lang$virtual_dom$VirtualDom$lazy3 = _elm_lang$virtual_dom$Native_VirtualDom.lazy3;
var _elm_lang$virtual_dom$VirtualDom$lazy2 = _elm_lang$virtual_dom$Native_VirtualDom.lazy2;
var _elm_lang$virtual_dom$VirtualDom$lazy = _elm_lang$virtual_dom$Native_VirtualDom.lazy;
var _elm_lang$virtual_dom$VirtualDom$defaultOptions = {stopPropagation: false, preventDefault: false};
var _elm_lang$virtual_dom$VirtualDom$onWithOptions = _elm_lang$virtual_dom$Native_VirtualDom.on;
var _elm_lang$virtual_dom$VirtualDom$on = F2(
	function (eventName, decoder) {
		return A3(_elm_lang$virtual_dom$VirtualDom$onWithOptions, eventName, _elm_lang$virtual_dom$VirtualDom$defaultOptions, decoder);
	});
var _elm_lang$virtual_dom$VirtualDom$style = _elm_lang$virtual_dom$Native_VirtualDom.style;
var _elm_lang$virtual_dom$VirtualDom$mapProperty = _elm_lang$virtual_dom$Native_VirtualDom.mapProperty;
var _elm_lang$virtual_dom$VirtualDom$attributeNS = _elm_lang$virtual_dom$Native_VirtualDom.attributeNS;
var _elm_lang$virtual_dom$VirtualDom$attribute = _elm_lang$virtual_dom$Native_VirtualDom.attribute;
var _elm_lang$virtual_dom$VirtualDom$property = _elm_lang$virtual_dom$Native_VirtualDom.property;
var _elm_lang$virtual_dom$VirtualDom$map = _elm_lang$virtual_dom$Native_VirtualDom.map;
var _elm_lang$virtual_dom$VirtualDom$text = _elm_lang$virtual_dom$Native_VirtualDom.text;
var _elm_lang$virtual_dom$VirtualDom$node = _elm_lang$virtual_dom$Native_VirtualDom.node;
var _elm_lang$virtual_dom$VirtualDom$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});
var _elm_lang$virtual_dom$VirtualDom$Node = {ctor: 'Node'};
var _elm_lang$virtual_dom$VirtualDom$Property = {ctor: 'Property'};

var _elm_lang$html$Html$programWithFlags = _elm_lang$virtual_dom$VirtualDom$programWithFlags;
var _elm_lang$html$Html$program = _elm_lang$virtual_dom$VirtualDom$program;
var _elm_lang$html$Html$beginnerProgram = function (_p0) {
	var _p1 = _p0;
	return _elm_lang$html$Html$program(
		{
			init: A2(
				_elm_lang$core$Platform_Cmd_ops['!'],
				_p1.model,
				{ctor: '[]'}),
			update: F2(
				function (msg, model) {
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						A2(_p1.update, msg, model),
						{ctor: '[]'});
				}),
			view: _p1.view,
			subscriptions: function (_p2) {
				return _elm_lang$core$Platform_Sub$none;
			}
		});
};
var _elm_lang$html$Html$map = _elm_lang$virtual_dom$VirtualDom$map;
var _elm_lang$html$Html$text = _elm_lang$virtual_dom$VirtualDom$text;
var _elm_lang$html$Html$node = _elm_lang$virtual_dom$VirtualDom$node;
var _elm_lang$html$Html$body = _elm_lang$html$Html$node('body');
var _elm_lang$html$Html$section = _elm_lang$html$Html$node('section');
var _elm_lang$html$Html$nav = _elm_lang$html$Html$node('nav');
var _elm_lang$html$Html$article = _elm_lang$html$Html$node('article');
var _elm_lang$html$Html$aside = _elm_lang$html$Html$node('aside');
var _elm_lang$html$Html$h1 = _elm_lang$html$Html$node('h1');
var _elm_lang$html$Html$h2 = _elm_lang$html$Html$node('h2');
var _elm_lang$html$Html$h3 = _elm_lang$html$Html$node('h3');
var _elm_lang$html$Html$h4 = _elm_lang$html$Html$node('h4');
var _elm_lang$html$Html$h5 = _elm_lang$html$Html$node('h5');
var _elm_lang$html$Html$h6 = _elm_lang$html$Html$node('h6');
var _elm_lang$html$Html$header = _elm_lang$html$Html$node('header');
var _elm_lang$html$Html$footer = _elm_lang$html$Html$node('footer');
var _elm_lang$html$Html$address = _elm_lang$html$Html$node('address');
var _elm_lang$html$Html$main_ = _elm_lang$html$Html$node('main');
var _elm_lang$html$Html$p = _elm_lang$html$Html$node('p');
var _elm_lang$html$Html$hr = _elm_lang$html$Html$node('hr');
var _elm_lang$html$Html$pre = _elm_lang$html$Html$node('pre');
var _elm_lang$html$Html$blockquote = _elm_lang$html$Html$node('blockquote');
var _elm_lang$html$Html$ol = _elm_lang$html$Html$node('ol');
var _elm_lang$html$Html$ul = _elm_lang$html$Html$node('ul');
var _elm_lang$html$Html$li = _elm_lang$html$Html$node('li');
var _elm_lang$html$Html$dl = _elm_lang$html$Html$node('dl');
var _elm_lang$html$Html$dt = _elm_lang$html$Html$node('dt');
var _elm_lang$html$Html$dd = _elm_lang$html$Html$node('dd');
var _elm_lang$html$Html$figure = _elm_lang$html$Html$node('figure');
var _elm_lang$html$Html$figcaption = _elm_lang$html$Html$node('figcaption');
var _elm_lang$html$Html$div = _elm_lang$html$Html$node('div');
var _elm_lang$html$Html$a = _elm_lang$html$Html$node('a');
var _elm_lang$html$Html$em = _elm_lang$html$Html$node('em');
var _elm_lang$html$Html$strong = _elm_lang$html$Html$node('strong');
var _elm_lang$html$Html$small = _elm_lang$html$Html$node('small');
var _elm_lang$html$Html$s = _elm_lang$html$Html$node('s');
var _elm_lang$html$Html$cite = _elm_lang$html$Html$node('cite');
var _elm_lang$html$Html$q = _elm_lang$html$Html$node('q');
var _elm_lang$html$Html$dfn = _elm_lang$html$Html$node('dfn');
var _elm_lang$html$Html$abbr = _elm_lang$html$Html$node('abbr');
var _elm_lang$html$Html$time = _elm_lang$html$Html$node('time');
var _elm_lang$html$Html$code = _elm_lang$html$Html$node('code');
var _elm_lang$html$Html$var = _elm_lang$html$Html$node('var');
var _elm_lang$html$Html$samp = _elm_lang$html$Html$node('samp');
var _elm_lang$html$Html$kbd = _elm_lang$html$Html$node('kbd');
var _elm_lang$html$Html$sub = _elm_lang$html$Html$node('sub');
var _elm_lang$html$Html$sup = _elm_lang$html$Html$node('sup');
var _elm_lang$html$Html$i = _elm_lang$html$Html$node('i');
var _elm_lang$html$Html$b = _elm_lang$html$Html$node('b');
var _elm_lang$html$Html$u = _elm_lang$html$Html$node('u');
var _elm_lang$html$Html$mark = _elm_lang$html$Html$node('mark');
var _elm_lang$html$Html$ruby = _elm_lang$html$Html$node('ruby');
var _elm_lang$html$Html$rt = _elm_lang$html$Html$node('rt');
var _elm_lang$html$Html$rp = _elm_lang$html$Html$node('rp');
var _elm_lang$html$Html$bdi = _elm_lang$html$Html$node('bdi');
var _elm_lang$html$Html$bdo = _elm_lang$html$Html$node('bdo');
var _elm_lang$html$Html$span = _elm_lang$html$Html$node('span');
var _elm_lang$html$Html$br = _elm_lang$html$Html$node('br');
var _elm_lang$html$Html$wbr = _elm_lang$html$Html$node('wbr');
var _elm_lang$html$Html$ins = _elm_lang$html$Html$node('ins');
var _elm_lang$html$Html$del = _elm_lang$html$Html$node('del');
var _elm_lang$html$Html$img = _elm_lang$html$Html$node('img');
var _elm_lang$html$Html$iframe = _elm_lang$html$Html$node('iframe');
var _elm_lang$html$Html$embed = _elm_lang$html$Html$node('embed');
var _elm_lang$html$Html$object = _elm_lang$html$Html$node('object');
var _elm_lang$html$Html$param = _elm_lang$html$Html$node('param');
var _elm_lang$html$Html$video = _elm_lang$html$Html$node('video');
var _elm_lang$html$Html$audio = _elm_lang$html$Html$node('audio');
var _elm_lang$html$Html$source = _elm_lang$html$Html$node('source');
var _elm_lang$html$Html$track = _elm_lang$html$Html$node('track');
var _elm_lang$html$Html$canvas = _elm_lang$html$Html$node('canvas');
var _elm_lang$html$Html$math = _elm_lang$html$Html$node('math');
var _elm_lang$html$Html$table = _elm_lang$html$Html$node('table');
var _elm_lang$html$Html$caption = _elm_lang$html$Html$node('caption');
var _elm_lang$html$Html$colgroup = _elm_lang$html$Html$node('colgroup');
var _elm_lang$html$Html$col = _elm_lang$html$Html$node('col');
var _elm_lang$html$Html$tbody = _elm_lang$html$Html$node('tbody');
var _elm_lang$html$Html$thead = _elm_lang$html$Html$node('thead');
var _elm_lang$html$Html$tfoot = _elm_lang$html$Html$node('tfoot');
var _elm_lang$html$Html$tr = _elm_lang$html$Html$node('tr');
var _elm_lang$html$Html$td = _elm_lang$html$Html$node('td');
var _elm_lang$html$Html$th = _elm_lang$html$Html$node('th');
var _elm_lang$html$Html$form = _elm_lang$html$Html$node('form');
var _elm_lang$html$Html$fieldset = _elm_lang$html$Html$node('fieldset');
var _elm_lang$html$Html$legend = _elm_lang$html$Html$node('legend');
var _elm_lang$html$Html$label = _elm_lang$html$Html$node('label');
var _elm_lang$html$Html$input = _elm_lang$html$Html$node('input');
var _elm_lang$html$Html$button = _elm_lang$html$Html$node('button');
var _elm_lang$html$Html$select = _elm_lang$html$Html$node('select');
var _elm_lang$html$Html$datalist = _elm_lang$html$Html$node('datalist');
var _elm_lang$html$Html$optgroup = _elm_lang$html$Html$node('optgroup');
var _elm_lang$html$Html$option = _elm_lang$html$Html$node('option');
var _elm_lang$html$Html$textarea = _elm_lang$html$Html$node('textarea');
var _elm_lang$html$Html$keygen = _elm_lang$html$Html$node('keygen');
var _elm_lang$html$Html$output = _elm_lang$html$Html$node('output');
var _elm_lang$html$Html$progress = _elm_lang$html$Html$node('progress');
var _elm_lang$html$Html$meter = _elm_lang$html$Html$node('meter');
var _elm_lang$html$Html$details = _elm_lang$html$Html$node('details');
var _elm_lang$html$Html$summary = _elm_lang$html$Html$node('summary');
var _elm_lang$html$Html$menuitem = _elm_lang$html$Html$node('menuitem');
var _elm_lang$html$Html$menu = _elm_lang$html$Html$node('menu');

var _elm_lang$html$Html_Attributes$map = _elm_lang$virtual_dom$VirtualDom$mapProperty;
var _elm_lang$html$Html_Attributes$attribute = _elm_lang$virtual_dom$VirtualDom$attribute;
var _elm_lang$html$Html_Attributes$contextmenu = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'contextmenu', value);
};
var _elm_lang$html$Html_Attributes$draggable = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'draggable', value);
};
var _elm_lang$html$Html_Attributes$itemprop = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'itemprop', value);
};
var _elm_lang$html$Html_Attributes$tabindex = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'tabIndex',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$charset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'charset', value);
};
var _elm_lang$html$Html_Attributes$height = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'height',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$width = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'width',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$formaction = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'formAction', value);
};
var _elm_lang$html$Html_Attributes$list = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'list', value);
};
var _elm_lang$html$Html_Attributes$minlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'minLength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$maxlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'maxlength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$size = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'size',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$form = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'form', value);
};
var _elm_lang$html$Html_Attributes$cols = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'cols',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rows = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rows',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$challenge = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'challenge', value);
};
var _elm_lang$html$Html_Attributes$media = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'media', value);
};
var _elm_lang$html$Html_Attributes$rel = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'rel', value);
};
var _elm_lang$html$Html_Attributes$datetime = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'datetime', value);
};
var _elm_lang$html$Html_Attributes$pubdate = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'pubdate', value);
};
var _elm_lang$html$Html_Attributes$colspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'colspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rowspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rowspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$manifest = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'manifest', value);
};
var _elm_lang$html$Html_Attributes$property = _elm_lang$virtual_dom$VirtualDom$property;
var _elm_lang$html$Html_Attributes$stringProperty = F2(
	function (name, string) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$string(string));
	});
var _elm_lang$html$Html_Attributes$class = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'className', name);
};
var _elm_lang$html$Html_Attributes$id = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'id', name);
};
var _elm_lang$html$Html_Attributes$title = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'title', name);
};
var _elm_lang$html$Html_Attributes$accesskey = function ($char) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'accessKey',
		_elm_lang$core$String$fromChar($char));
};
var _elm_lang$html$Html_Attributes$dir = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dir', value);
};
var _elm_lang$html$Html_Attributes$dropzone = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dropzone', value);
};
var _elm_lang$html$Html_Attributes$lang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'lang', value);
};
var _elm_lang$html$Html_Attributes$content = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'content', value);
};
var _elm_lang$html$Html_Attributes$httpEquiv = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'httpEquiv', value);
};
var _elm_lang$html$Html_Attributes$language = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'language', value);
};
var _elm_lang$html$Html_Attributes$src = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'src', value);
};
var _elm_lang$html$Html_Attributes$alt = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'alt', value);
};
var _elm_lang$html$Html_Attributes$preload = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'preload', value);
};
var _elm_lang$html$Html_Attributes$poster = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'poster', value);
};
var _elm_lang$html$Html_Attributes$kind = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'kind', value);
};
var _elm_lang$html$Html_Attributes$srclang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srclang', value);
};
var _elm_lang$html$Html_Attributes$sandbox = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'sandbox', value);
};
var _elm_lang$html$Html_Attributes$srcdoc = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srcdoc', value);
};
var _elm_lang$html$Html_Attributes$type_ = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'type', value);
};
var _elm_lang$html$Html_Attributes$value = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'value', value);
};
var _elm_lang$html$Html_Attributes$defaultValue = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'defaultValue', value);
};
var _elm_lang$html$Html_Attributes$placeholder = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'placeholder', value);
};
var _elm_lang$html$Html_Attributes$accept = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'accept', value);
};
var _elm_lang$html$Html_Attributes$acceptCharset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'acceptCharset', value);
};
var _elm_lang$html$Html_Attributes$action = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'action', value);
};
var _elm_lang$html$Html_Attributes$autocomplete = function (bool) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'autocomplete',
		bool ? 'on' : 'off');
};
var _elm_lang$html$Html_Attributes$enctype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'enctype', value);
};
var _elm_lang$html$Html_Attributes$method = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'method', value);
};
var _elm_lang$html$Html_Attributes$name = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'name', value);
};
var _elm_lang$html$Html_Attributes$pattern = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'pattern', value);
};
var _elm_lang$html$Html_Attributes$for = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'htmlFor', value);
};
var _elm_lang$html$Html_Attributes$max = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'max', value);
};
var _elm_lang$html$Html_Attributes$min = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'min', value);
};
var _elm_lang$html$Html_Attributes$step = function (n) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'step', n);
};
var _elm_lang$html$Html_Attributes$wrap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'wrap', value);
};
var _elm_lang$html$Html_Attributes$usemap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'useMap', value);
};
var _elm_lang$html$Html_Attributes$shape = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'shape', value);
};
var _elm_lang$html$Html_Attributes$coords = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'coords', value);
};
var _elm_lang$html$Html_Attributes$keytype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'keytype', value);
};
var _elm_lang$html$Html_Attributes$align = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'align', value);
};
var _elm_lang$html$Html_Attributes$cite = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'cite', value);
};
var _elm_lang$html$Html_Attributes$href = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'href', value);
};
var _elm_lang$html$Html_Attributes$target = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'target', value);
};
var _elm_lang$html$Html_Attributes$downloadAs = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'download', value);
};
var _elm_lang$html$Html_Attributes$hreflang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'hreflang', value);
};
var _elm_lang$html$Html_Attributes$ping = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'ping', value);
};
var _elm_lang$html$Html_Attributes$start = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'start',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$headers = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'headers', value);
};
var _elm_lang$html$Html_Attributes$scope = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'scope', value);
};
var _elm_lang$html$Html_Attributes$boolProperty = F2(
	function (name, bool) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$bool(bool));
	});
var _elm_lang$html$Html_Attributes$hidden = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'hidden', bool);
};
var _elm_lang$html$Html_Attributes$contenteditable = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'contentEditable', bool);
};
var _elm_lang$html$Html_Attributes$spellcheck = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'spellcheck', bool);
};
var _elm_lang$html$Html_Attributes$async = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'async', bool);
};
var _elm_lang$html$Html_Attributes$defer = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'defer', bool);
};
var _elm_lang$html$Html_Attributes$scoped = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'scoped', bool);
};
var _elm_lang$html$Html_Attributes$autoplay = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autoplay', bool);
};
var _elm_lang$html$Html_Attributes$controls = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'controls', bool);
};
var _elm_lang$html$Html_Attributes$loop = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'loop', bool);
};
var _elm_lang$html$Html_Attributes$default = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'default', bool);
};
var _elm_lang$html$Html_Attributes$seamless = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'seamless', bool);
};
var _elm_lang$html$Html_Attributes$checked = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'checked', bool);
};
var _elm_lang$html$Html_Attributes$selected = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'selected', bool);
};
var _elm_lang$html$Html_Attributes$autofocus = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autofocus', bool);
};
var _elm_lang$html$Html_Attributes$disabled = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'disabled', bool);
};
var _elm_lang$html$Html_Attributes$multiple = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'multiple', bool);
};
var _elm_lang$html$Html_Attributes$novalidate = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'noValidate', bool);
};
var _elm_lang$html$Html_Attributes$readonly = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'readOnly', bool);
};
var _elm_lang$html$Html_Attributes$required = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'required', bool);
};
var _elm_lang$html$Html_Attributes$ismap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'isMap', value);
};
var _elm_lang$html$Html_Attributes$download = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'download', bool);
};
var _elm_lang$html$Html_Attributes$reversed = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'reversed', bool);
};
var _elm_lang$html$Html_Attributes$classList = function (list) {
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$String$join,
			' ',
			A2(
				_elm_lang$core$List$map,
				_elm_lang$core$Tuple$first,
				A2(_elm_lang$core$List$filter, _elm_lang$core$Tuple$second, list))));
};
var _elm_lang$html$Html_Attributes$style = _elm_lang$virtual_dom$VirtualDom$style;

//import Result //

var _elm_lang$core$Native_Date = function() {

function fromString(str)
{
	var date = new Date(str);
	return isNaN(date.getTime())
		? _elm_lang$core$Result$Err('Unable to parse \'' + str + '\' as a date. Dates must be in the ISO 8601 format.')
		: _elm_lang$core$Result$Ok(date);
}

var dayTable = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
var monthTable =
	['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
	 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


return {
	fromString: fromString,
	year: function(d) { return d.getFullYear(); },
	month: function(d) { return { ctor: monthTable[d.getMonth()] }; },
	day: function(d) { return d.getDate(); },
	hour: function(d) { return d.getHours(); },
	minute: function(d) { return d.getMinutes(); },
	second: function(d) { return d.getSeconds(); },
	millisecond: function(d) { return d.getMilliseconds(); },
	toTime: function(d) { return d.getTime(); },
	fromTime: function(t) { return new Date(t); },
	dayOfWeek: function(d) { return { ctor: dayTable[d.getDay()] }; }
};

}();
var _elm_lang$core$Task$onError = _elm_lang$core$Native_Scheduler.onError;
var _elm_lang$core$Task$andThen = _elm_lang$core$Native_Scheduler.andThen;
var _elm_lang$core$Task$spawnCmd = F2(
	function (router, _p0) {
		var _p1 = _p0;
		return _elm_lang$core$Native_Scheduler.spawn(
			A2(
				_elm_lang$core$Task$andThen,
				_elm_lang$core$Platform$sendToApp(router),
				_p1._0));
	});
var _elm_lang$core$Task$fail = _elm_lang$core$Native_Scheduler.fail;
var _elm_lang$core$Task$mapError = F2(
	function (convert, task) {
		return A2(
			_elm_lang$core$Task$onError,
			function (_p2) {
				return _elm_lang$core$Task$fail(
					convert(_p2));
			},
			task);
	});
var _elm_lang$core$Task$succeed = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return _elm_lang$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var _elm_lang$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return _elm_lang$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map3 = F4(
	function (func, taskA, taskB, taskC) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return _elm_lang$core$Task$succeed(
									A3(func, a, b, c));
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map4 = F5(
	function (func, taskA, taskB, taskC, taskD) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return _elm_lang$core$Task$succeed(
											A4(func, a, b, c, d));
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map5 = F6(
	function (func, taskA, taskB, taskC, taskD, taskE) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return A2(
											_elm_lang$core$Task$andThen,
											function (e) {
												return _elm_lang$core$Task$succeed(
													A5(func, a, b, c, d, e));
											},
											taskE);
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$sequence = function (tasks) {
	var _p3 = tasks;
	if (_p3.ctor === '[]') {
		return _elm_lang$core$Task$succeed(
			{ctor: '[]'});
	} else {
		return A3(
			_elm_lang$core$Task$map2,
			F2(
				function (x, y) {
					return {ctor: '::', _0: x, _1: y};
				}),
			_p3._0,
			_elm_lang$core$Task$sequence(_p3._1));
	}
};
var _elm_lang$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			_elm_lang$core$Task$map,
			function (_p4) {
				return {ctor: '_Tuple0'};
			},
			_elm_lang$core$Task$sequence(
				A2(
					_elm_lang$core$List$map,
					_elm_lang$core$Task$spawnCmd(router),
					commands)));
	});
var _elm_lang$core$Task$init = _elm_lang$core$Task$succeed(
	{ctor: '_Tuple0'});
var _elm_lang$core$Task$onSelfMsg = F3(
	function (_p7, _p6, _p5) {
		return _elm_lang$core$Task$succeed(
			{ctor: '_Tuple0'});
	});
var _elm_lang$core$Task$command = _elm_lang$core$Native_Platform.leaf('Task');
var _elm_lang$core$Task$Perform = function (a) {
	return {ctor: 'Perform', _0: a};
};
var _elm_lang$core$Task$perform = F2(
	function (toMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(_elm_lang$core$Task$map, toMessage, task)));
	});
var _elm_lang$core$Task$attempt = F2(
	function (resultToMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(
					_elm_lang$core$Task$onError,
					function (_p8) {
						return _elm_lang$core$Task$succeed(
							resultToMessage(
								_elm_lang$core$Result$Err(_p8)));
					},
					A2(
						_elm_lang$core$Task$andThen,
						function (_p9) {
							return _elm_lang$core$Task$succeed(
								resultToMessage(
									_elm_lang$core$Result$Ok(_p9)));
						},
						task))));
	});
var _elm_lang$core$Task$cmdMap = F2(
	function (tagger, _p10) {
		var _p11 = _p10;
		return _elm_lang$core$Task$Perform(
			A2(_elm_lang$core$Task$map, tagger, _p11._0));
	});
_elm_lang$core$Native_Platform.effectManagers['Task'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Task$init, onEffects: _elm_lang$core$Task$onEffects, onSelfMsg: _elm_lang$core$Task$onSelfMsg, tag: 'cmd', cmdMap: _elm_lang$core$Task$cmdMap};

//import Native.Scheduler //

var _elm_lang$core$Native_Time = function() {

var now = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
{
	callback(_elm_lang$core$Native_Scheduler.succeed(Date.now()));
});

function setInterval_(interval, task)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var id = setInterval(function() {
			_elm_lang$core$Native_Scheduler.rawSpawn(task);
		}, interval);

		return function() { clearInterval(id); };
	});
}

return {
	now: now,
	setInterval_: F2(setInterval_)
};

}();
var _elm_lang$core$Time$setInterval = _elm_lang$core$Native_Time.setInterval_;
var _elm_lang$core$Time$spawnHelp = F3(
	function (router, intervals, processes) {
		var _p0 = intervals;
		if (_p0.ctor === '[]') {
			return _elm_lang$core$Task$succeed(processes);
		} else {
			var _p1 = _p0._0;
			var spawnRest = function (id) {
				return A3(
					_elm_lang$core$Time$spawnHelp,
					router,
					_p0._1,
					A3(_elm_lang$core$Dict$insert, _p1, id, processes));
			};
			var spawnTimer = _elm_lang$core$Native_Scheduler.spawn(
				A2(
					_elm_lang$core$Time$setInterval,
					_p1,
					A2(_elm_lang$core$Platform$sendToSelf, router, _p1)));
			return A2(_elm_lang$core$Task$andThen, spawnRest, spawnTimer);
		}
	});
var _elm_lang$core$Time$addMySub = F2(
	function (_p2, state) {
		var _p3 = _p2;
		var _p6 = _p3._1;
		var _p5 = _p3._0;
		var _p4 = A2(_elm_lang$core$Dict$get, _p5, state);
		if (_p4.ctor === 'Nothing') {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{
					ctor: '::',
					_0: _p6,
					_1: {ctor: '[]'}
				},
				state);
		} else {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{ctor: '::', _0: _p6, _1: _p4._0},
				state);
		}
	});
var _elm_lang$core$Time$inMilliseconds = function (t) {
	return t;
};
var _elm_lang$core$Time$millisecond = 1;
var _elm_lang$core$Time$second = 1000 * _elm_lang$core$Time$millisecond;
var _elm_lang$core$Time$minute = 60 * _elm_lang$core$Time$second;
var _elm_lang$core$Time$hour = 60 * _elm_lang$core$Time$minute;
var _elm_lang$core$Time$inHours = function (t) {
	return t / _elm_lang$core$Time$hour;
};
var _elm_lang$core$Time$inMinutes = function (t) {
	return t / _elm_lang$core$Time$minute;
};
var _elm_lang$core$Time$inSeconds = function (t) {
	return t / _elm_lang$core$Time$second;
};
var _elm_lang$core$Time$now = _elm_lang$core$Native_Time.now;
var _elm_lang$core$Time$onSelfMsg = F3(
	function (router, interval, state) {
		var _p7 = A2(_elm_lang$core$Dict$get, interval, state.taggers);
		if (_p7.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var tellTaggers = function (time) {
				return _elm_lang$core$Task$sequence(
					A2(
						_elm_lang$core$List$map,
						function (tagger) {
							return A2(
								_elm_lang$core$Platform$sendToApp,
								router,
								tagger(time));
						},
						_p7._0));
			};
			return A2(
				_elm_lang$core$Task$andThen,
				function (_p8) {
					return _elm_lang$core$Task$succeed(state);
				},
				A2(_elm_lang$core$Task$andThen, tellTaggers, _elm_lang$core$Time$now));
		}
	});
var _elm_lang$core$Time$subscription = _elm_lang$core$Native_Platform.leaf('Time');
var _elm_lang$core$Time$State = F2(
	function (a, b) {
		return {taggers: a, processes: b};
	});
var _elm_lang$core$Time$init = _elm_lang$core$Task$succeed(
	A2(_elm_lang$core$Time$State, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty));
var _elm_lang$core$Time$onEffects = F3(
	function (router, subs, _p9) {
		var _p10 = _p9;
		var rightStep = F3(
			function (_p12, id, _p11) {
				var _p13 = _p11;
				return {
					ctor: '_Tuple3',
					_0: _p13._0,
					_1: _p13._1,
					_2: A2(
						_elm_lang$core$Task$andThen,
						function (_p14) {
							return _p13._2;
						},
						_elm_lang$core$Native_Scheduler.kill(id))
				};
			});
		var bothStep = F4(
			function (interval, taggers, id, _p15) {
				var _p16 = _p15;
				return {
					ctor: '_Tuple3',
					_0: _p16._0,
					_1: A3(_elm_lang$core$Dict$insert, interval, id, _p16._1),
					_2: _p16._2
				};
			});
		var leftStep = F3(
			function (interval, taggers, _p17) {
				var _p18 = _p17;
				return {
					ctor: '_Tuple3',
					_0: {ctor: '::', _0: interval, _1: _p18._0},
					_1: _p18._1,
					_2: _p18._2
				};
			});
		var newTaggers = A3(_elm_lang$core$List$foldl, _elm_lang$core$Time$addMySub, _elm_lang$core$Dict$empty, subs);
		var _p19 = A6(
			_elm_lang$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			newTaggers,
			_p10.processes,
			{
				ctor: '_Tuple3',
				_0: {ctor: '[]'},
				_1: _elm_lang$core$Dict$empty,
				_2: _elm_lang$core$Task$succeed(
					{ctor: '_Tuple0'})
			});
		var spawnList = _p19._0;
		var existingDict = _p19._1;
		var killTask = _p19._2;
		return A2(
			_elm_lang$core$Task$andThen,
			function (newProcesses) {
				return _elm_lang$core$Task$succeed(
					A2(_elm_lang$core$Time$State, newTaggers, newProcesses));
			},
			A2(
				_elm_lang$core$Task$andThen,
				function (_p20) {
					return A3(_elm_lang$core$Time$spawnHelp, router, spawnList, existingDict);
				},
				killTask));
	});
var _elm_lang$core$Time$Every = F2(
	function (a, b) {
		return {ctor: 'Every', _0: a, _1: b};
	});
var _elm_lang$core$Time$every = F2(
	function (interval, tagger) {
		return _elm_lang$core$Time$subscription(
			A2(_elm_lang$core$Time$Every, interval, tagger));
	});
var _elm_lang$core$Time$subMap = F2(
	function (f, _p21) {
		var _p22 = _p21;
		return A2(
			_elm_lang$core$Time$Every,
			_p22._0,
			function (_p23) {
				return f(
					_p22._1(_p23));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Time'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Time$init, onEffects: _elm_lang$core$Time$onEffects, onSelfMsg: _elm_lang$core$Time$onSelfMsg, tag: 'sub', subMap: _elm_lang$core$Time$subMap};

var _elm_lang$core$Date$millisecond = _elm_lang$core$Native_Date.millisecond;
var _elm_lang$core$Date$second = _elm_lang$core$Native_Date.second;
var _elm_lang$core$Date$minute = _elm_lang$core$Native_Date.minute;
var _elm_lang$core$Date$hour = _elm_lang$core$Native_Date.hour;
var _elm_lang$core$Date$dayOfWeek = _elm_lang$core$Native_Date.dayOfWeek;
var _elm_lang$core$Date$day = _elm_lang$core$Native_Date.day;
var _elm_lang$core$Date$month = _elm_lang$core$Native_Date.month;
var _elm_lang$core$Date$year = _elm_lang$core$Native_Date.year;
var _elm_lang$core$Date$fromTime = _elm_lang$core$Native_Date.fromTime;
var _elm_lang$core$Date$toTime = _elm_lang$core$Native_Date.toTime;
var _elm_lang$core$Date$fromString = _elm_lang$core$Native_Date.fromString;
var _elm_lang$core$Date$now = A2(_elm_lang$core$Task$map, _elm_lang$core$Date$fromTime, _elm_lang$core$Time$now);
var _elm_lang$core$Date$Date = {ctor: 'Date'};
var _elm_lang$core$Date$Sun = {ctor: 'Sun'};
var _elm_lang$core$Date$Sat = {ctor: 'Sat'};
var _elm_lang$core$Date$Fri = {ctor: 'Fri'};
var _elm_lang$core$Date$Thu = {ctor: 'Thu'};
var _elm_lang$core$Date$Wed = {ctor: 'Wed'};
var _elm_lang$core$Date$Tue = {ctor: 'Tue'};
var _elm_lang$core$Date$Mon = {ctor: 'Mon'};
var _elm_lang$core$Date$Dec = {ctor: 'Dec'};
var _elm_lang$core$Date$Nov = {ctor: 'Nov'};
var _elm_lang$core$Date$Oct = {ctor: 'Oct'};
var _elm_lang$core$Date$Sep = {ctor: 'Sep'};
var _elm_lang$core$Date$Aug = {ctor: 'Aug'};
var _elm_lang$core$Date$Jul = {ctor: 'Jul'};
var _elm_lang$core$Date$Jun = {ctor: 'Jun'};
var _elm_lang$core$Date$May = {ctor: 'May'};
var _elm_lang$core$Date$Apr = {ctor: 'Apr'};
var _elm_lang$core$Date$Mar = {ctor: 'Mar'};
var _elm_lang$core$Date$Feb = {ctor: 'Feb'};
var _elm_lang$core$Date$Jan = {ctor: 'Jan'};

var _elm_lang$core$Set$foldr = F3(
	function (f, b, _p0) {
		var _p1 = _p0;
		return A3(
			_elm_lang$core$Dict$foldr,
			F3(
				function (k, _p2, b) {
					return A2(f, k, b);
				}),
			b,
			_p1._0);
	});
var _elm_lang$core$Set$foldl = F3(
	function (f, b, _p3) {
		var _p4 = _p3;
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, _p5, b) {
					return A2(f, k, b);
				}),
			b,
			_p4._0);
	});
var _elm_lang$core$Set$toList = function (_p6) {
	var _p7 = _p6;
	return _elm_lang$core$Dict$keys(_p7._0);
};
var _elm_lang$core$Set$size = function (_p8) {
	var _p9 = _p8;
	return _elm_lang$core$Dict$size(_p9._0);
};
var _elm_lang$core$Set$member = F2(
	function (k, _p10) {
		var _p11 = _p10;
		return A2(_elm_lang$core$Dict$member, k, _p11._0);
	});
var _elm_lang$core$Set$isEmpty = function (_p12) {
	var _p13 = _p12;
	return _elm_lang$core$Dict$isEmpty(_p13._0);
};
var _elm_lang$core$Set$Set_elm_builtin = function (a) {
	return {ctor: 'Set_elm_builtin', _0: a};
};
var _elm_lang$core$Set$empty = _elm_lang$core$Set$Set_elm_builtin(_elm_lang$core$Dict$empty);
var _elm_lang$core$Set$singleton = function (k) {
	return _elm_lang$core$Set$Set_elm_builtin(
		A2(
			_elm_lang$core$Dict$singleton,
			k,
			{ctor: '_Tuple0'}));
};
var _elm_lang$core$Set$insert = F2(
	function (k, _p14) {
		var _p15 = _p14;
		return _elm_lang$core$Set$Set_elm_builtin(
			A3(
				_elm_lang$core$Dict$insert,
				k,
				{ctor: '_Tuple0'},
				_p15._0));
	});
var _elm_lang$core$Set$fromList = function (xs) {
	return A3(_elm_lang$core$List$foldl, _elm_lang$core$Set$insert, _elm_lang$core$Set$empty, xs);
};
var _elm_lang$core$Set$map = F2(
	function (f, s) {
		return _elm_lang$core$Set$fromList(
			A2(
				_elm_lang$core$List$map,
				f,
				_elm_lang$core$Set$toList(s)));
	});
var _elm_lang$core$Set$remove = F2(
	function (k, _p16) {
		var _p17 = _p16;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$remove, k, _p17._0));
	});
var _elm_lang$core$Set$union = F2(
	function (_p19, _p18) {
		var _p20 = _p19;
		var _p21 = _p18;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$union, _p20._0, _p21._0));
	});
var _elm_lang$core$Set$intersect = F2(
	function (_p23, _p22) {
		var _p24 = _p23;
		var _p25 = _p22;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$intersect, _p24._0, _p25._0));
	});
var _elm_lang$core$Set$diff = F2(
	function (_p27, _p26) {
		var _p28 = _p27;
		var _p29 = _p26;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$diff, _p28._0, _p29._0));
	});
var _elm_lang$core$Set$filter = F2(
	function (p, _p30) {
		var _p31 = _p30;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(
				_elm_lang$core$Dict$filter,
				F2(
					function (k, _p32) {
						return p(k);
					}),
				_p31._0));
	});
var _elm_lang$core$Set$partition = F2(
	function (p, _p33) {
		var _p34 = _p33;
		var _p35 = A2(
			_elm_lang$core$Dict$partition,
			F2(
				function (k, _p36) {
					return p(k);
				}),
			_p34._0);
		var p1 = _p35._0;
		var p2 = _p35._1;
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Set$Set_elm_builtin(p1),
			_1: _elm_lang$core$Set$Set_elm_builtin(p2)
		};
	});

var _elm_community$json_extra$Json_Decode_Extra$when = F3(
	function (checkDecoder, check, passDecoder) {
		return A2(
			_elm_lang$core$Json_Decode$andThen,
			function (checkVal) {
				return check(checkVal) ? passDecoder : _elm_lang$core$Json_Decode$fail(
					A2(
						_elm_lang$core$Basics_ops['++'],
						'Check failed with input `',
						A2(
							_elm_lang$core$Basics_ops['++'],
							_elm_lang$core$Basics$toString(checkVal),
							'`')));
			},
			checkDecoder);
	});
var _elm_community$json_extra$Json_Decode_Extra$combine = A2(
	_elm_lang$core$List$foldr,
	_elm_lang$core$Json_Decode$map2(
		F2(
			function (x, y) {
				return {ctor: '::', _0: x, _1: y};
			})),
	_elm_lang$core$Json_Decode$succeed(
		{ctor: '[]'}));
var _elm_community$json_extra$Json_Decode_Extra$collection = function (decoder) {
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		function (length) {
			return _elm_community$json_extra$Json_Decode_Extra$combine(
				A2(
					_elm_lang$core$List$map,
					function (index) {
						return A2(
							_elm_lang$core$Json_Decode$field,
							_elm_lang$core$Basics$toString(index),
							decoder);
					},
					A2(_elm_lang$core$List$range, 0, length - 1)));
		},
		A2(_elm_lang$core$Json_Decode$field, 'length', _elm_lang$core$Json_Decode$int));
};
var _elm_community$json_extra$Json_Decode_Extra$fromResult = function (result) {
	var _p0 = result;
	if (_p0.ctor === 'Ok') {
		return _elm_lang$core$Json_Decode$succeed(_p0._0);
	} else {
		return _elm_lang$core$Json_Decode$fail(_p0._0);
	}
};
var _elm_community$json_extra$Json_Decode_Extra$parseInt = A2(
	_elm_lang$core$Json_Decode$andThen,
	function (_p1) {
		return _elm_community$json_extra$Json_Decode_Extra$fromResult(
			_elm_lang$core$String$toInt(_p1));
	},
	_elm_lang$core$Json_Decode$string);
var _elm_community$json_extra$Json_Decode_Extra$parseFloat = A2(
	_elm_lang$core$Json_Decode$andThen,
	function (_p2) {
		return _elm_community$json_extra$Json_Decode_Extra$fromResult(
			_elm_lang$core$String$toFloat(_p2));
	},
	_elm_lang$core$Json_Decode$string);
var _elm_community$json_extra$Json_Decode_Extra$doubleEncoded = function (decoder) {
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		function (_p3) {
			return _elm_community$json_extra$Json_Decode_Extra$fromResult(
				A2(_elm_lang$core$Json_Decode$decodeString, decoder, _p3));
		},
		_elm_lang$core$Json_Decode$string);
};
var _elm_community$json_extra$Json_Decode_Extra$keys = A2(
	_elm_lang$core$Json_Decode$map,
	A2(
		_elm_lang$core$List$foldl,
		F2(
			function (_p4, acc) {
				var _p5 = _p4;
				return {ctor: '::', _0: _p5._0, _1: acc};
			}),
		{ctor: '[]'}),
	_elm_lang$core$Json_Decode$keyValuePairs(
		_elm_lang$core$Json_Decode$succeed(
			{ctor: '_Tuple0'})));
var _elm_community$json_extra$Json_Decode_Extra$sequenceHelp = F2(
	function (decoders, jsonValues) {
		return (!_elm_lang$core$Native_Utils.eq(
			_elm_lang$core$List$length(jsonValues),
			_elm_lang$core$List$length(decoders))) ? _elm_lang$core$Json_Decode$fail('Number of decoders does not match number of values') : _elm_community$json_extra$Json_Decode_Extra$fromResult(
			A3(
				_elm_lang$core$List$foldr,
				_elm_lang$core$Result$map2(
					F2(
						function (x, y) {
							return {ctor: '::', _0: x, _1: y};
						})),
				_elm_lang$core$Result$Ok(
					{ctor: '[]'}),
				A3(_elm_lang$core$List$map2, _elm_lang$core$Json_Decode$decodeValue, decoders, jsonValues)));
	});
var _elm_community$json_extra$Json_Decode_Extra$sequence = function (decoders) {
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		_elm_community$json_extra$Json_Decode_Extra$sequenceHelp(decoders),
		_elm_lang$core$Json_Decode$list(_elm_lang$core$Json_Decode$value));
};
var _elm_community$json_extra$Json_Decode_Extra$indexedList = function (indexedDecoder) {
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		function (values) {
			return _elm_community$json_extra$Json_Decode_Extra$sequence(
				A2(
					_elm_lang$core$List$map,
					indexedDecoder,
					A2(
						_elm_lang$core$List$range,
						0,
						_elm_lang$core$List$length(values) - 1)));
		},
		_elm_lang$core$Json_Decode$list(_elm_lang$core$Json_Decode$value));
};
var _elm_community$json_extra$Json_Decode_Extra$optionalField = F2(
	function (fieldName, decoder) {
		var finishDecoding = function (json) {
			var _p6 = A2(
				_elm_lang$core$Json_Decode$decodeValue,
				A2(_elm_lang$core$Json_Decode$field, fieldName, _elm_lang$core$Json_Decode$value),
				json);
			if (_p6.ctor === 'Ok') {
				return A2(
					_elm_lang$core$Json_Decode$map,
					_elm_lang$core$Maybe$Just,
					A2(_elm_lang$core$Json_Decode$field, fieldName, decoder));
			} else {
				return _elm_lang$core$Json_Decode$succeed(_elm_lang$core$Maybe$Nothing);
			}
		};
		return A2(_elm_lang$core$Json_Decode$andThen, finishDecoding, _elm_lang$core$Json_Decode$value);
	});
var _elm_community$json_extra$Json_Decode_Extra$withDefault = F2(
	function (fallback, decoder) {
		return A2(
			_elm_lang$core$Json_Decode$map,
			_elm_lang$core$Maybe$withDefault(fallback),
			_elm_lang$core$Json_Decode$maybe(decoder));
	});
var _elm_community$json_extra$Json_Decode_Extra$decodeDictFromTuples = F2(
	function (keyDecoder, tuples) {
		var _p7 = tuples;
		if (_p7.ctor === '[]') {
			return _elm_lang$core$Json_Decode$succeed(_elm_lang$core$Dict$empty);
		} else {
			var _p8 = A2(_elm_lang$core$Json_Decode$decodeString, keyDecoder, _p7._0._0);
			if (_p8.ctor === 'Ok') {
				return A2(
					_elm_lang$core$Json_Decode$andThen,
					function (_p9) {
						return _elm_lang$core$Json_Decode$succeed(
							A3(_elm_lang$core$Dict$insert, _p8._0, _p7._0._1, _p9));
					},
					A2(_elm_community$json_extra$Json_Decode_Extra$decodeDictFromTuples, keyDecoder, _p7._1));
			} else {
				return _elm_lang$core$Json_Decode$fail(_p8._0);
			}
		}
	});
var _elm_community$json_extra$Json_Decode_Extra$dict2 = F2(
	function (keyDecoder, valueDecoder) {
		return A2(
			_elm_lang$core$Json_Decode$andThen,
			_elm_community$json_extra$Json_Decode_Extra$decodeDictFromTuples(keyDecoder),
			_elm_lang$core$Json_Decode$keyValuePairs(valueDecoder));
	});
var _elm_community$json_extra$Json_Decode_Extra$set = function (decoder) {
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$Set$fromList,
		_elm_lang$core$Json_Decode$list(decoder));
};
var _elm_community$json_extra$Json_Decode_Extra$date = A2(
	_elm_lang$core$Json_Decode$andThen,
	function (_p10) {
		return _elm_community$json_extra$Json_Decode_Extra$fromResult(
			_elm_lang$core$Date$fromString(_p10));
	},
	_elm_lang$core$Json_Decode$string);
var _elm_community$json_extra$Json_Decode_Extra$andMap = _elm_lang$core$Json_Decode$map2(
	F2(
		function (x, y) {
			return y(x);
		}));
var _elm_community$json_extra$Json_Decode_Extra_ops = _elm_community$json_extra$Json_Decode_Extra_ops || {};
_elm_community$json_extra$Json_Decode_Extra_ops['|:'] = _elm_lang$core$Basics$flip(_elm_community$json_extra$Json_Decode_Extra$andMap);

var _elm_lang$core$Process$kill = _elm_lang$core$Native_Scheduler.kill;
var _elm_lang$core$Process$sleep = _elm_lang$core$Native_Scheduler.sleep;
var _elm_lang$core$Process$spawn = _elm_lang$core$Native_Scheduler.spawn;

var _elm_lang$dom$Native_Dom = function() {

var fakeNode = {
	addEventListener: function() {},
	removeEventListener: function() {}
};

var onDocument = on(typeof document !== 'undefined' ? document : fakeNode);
var onWindow = on(typeof window !== 'undefined' ? window : fakeNode);

function on(node)
{
	return function(eventName, decoder, toTask)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {

			function performTask(event)
			{
				var result = A2(_elm_lang$core$Json_Decode$decodeValue, decoder, event);
				if (result.ctor === 'Ok')
				{
					_elm_lang$core$Native_Scheduler.rawSpawn(toTask(result._0));
				}
			}

			node.addEventListener(eventName, performTask);

			return function()
			{
				node.removeEventListener(eventName, performTask);
			};
		});
	};
}

var rAF = typeof requestAnimationFrame !== 'undefined'
	? requestAnimationFrame
	: function(callback) { callback(); };

function withNode(id, doStuff)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		rAF(function()
		{
			var node = document.getElementById(id);
			if (node === null)
			{
				callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'NotFound', _0: id }));
				return;
			}
			callback(_elm_lang$core$Native_Scheduler.succeed(doStuff(node)));
		});
	});
}


// FOCUS

function focus(id)
{
	return withNode(id, function(node) {
		node.focus();
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function blur(id)
{
	return withNode(id, function(node) {
		node.blur();
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}


// SCROLLING

function getScrollTop(id)
{
	return withNode(id, function(node) {
		return node.scrollTop;
	});
}

function setScrollTop(id, desiredScrollTop)
{
	return withNode(id, function(node) {
		node.scrollTop = desiredScrollTop;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function toBottom(id)
{
	return withNode(id, function(node) {
		node.scrollTop = node.scrollHeight;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function getScrollLeft(id)
{
	return withNode(id, function(node) {
		return node.scrollLeft;
	});
}

function setScrollLeft(id, desiredScrollLeft)
{
	return withNode(id, function(node) {
		node.scrollLeft = desiredScrollLeft;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function toRight(id)
{
	return withNode(id, function(node) {
		node.scrollLeft = node.scrollWidth;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}


// SIZE

function width(options, id)
{
	return withNode(id, function(node) {
		switch (options.ctor)
		{
			case 'Content':
				return node.scrollWidth;
			case 'VisibleContent':
				return node.clientWidth;
			case 'VisibleContentWithBorders':
				return node.offsetWidth;
			case 'VisibleContentWithBordersAndMargins':
				var rect = node.getBoundingClientRect();
				return rect.right - rect.left;
		}
	});
}

function height(options, id)
{
	return withNode(id, function(node) {
		switch (options.ctor)
		{
			case 'Content':
				return node.scrollHeight;
			case 'VisibleContent':
				return node.clientHeight;
			case 'VisibleContentWithBorders':
				return node.offsetHeight;
			case 'VisibleContentWithBordersAndMargins':
				var rect = node.getBoundingClientRect();
				return rect.bottom - rect.top;
		}
	});
}

return {
	onDocument: F3(onDocument),
	onWindow: F3(onWindow),

	focus: focus,
	blur: blur,

	getScrollTop: getScrollTop,
	setScrollTop: F2(setScrollTop),
	getScrollLeft: getScrollLeft,
	setScrollLeft: F2(setScrollLeft),
	toBottom: toBottom,
	toRight: toRight,

	height: F2(height),
	width: F2(width)
};

}();

var _elm_lang$dom$Dom$blur = _elm_lang$dom$Native_Dom.blur;
var _elm_lang$dom$Dom$focus = _elm_lang$dom$Native_Dom.focus;
var _elm_lang$dom$Dom$NotFound = function (a) {
	return {ctor: 'NotFound', _0: a};
};

var _elm_lang$dom$Dom_LowLevel$onWindow = _elm_lang$dom$Native_Dom.onWindow;
var _elm_lang$dom$Dom_LowLevel$onDocument = _elm_lang$dom$Native_Dom.onDocument;

var _elm_lang$html$Html_Events$keyCode = A2(_elm_lang$core$Json_Decode$field, 'keyCode', _elm_lang$core$Json_Decode$int);
var _elm_lang$html$Html_Events$targetChecked = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'checked',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$bool);
var _elm_lang$html$Html_Events$targetValue = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'value',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$string);
var _elm_lang$html$Html_Events$defaultOptions = _elm_lang$virtual_dom$VirtualDom$defaultOptions;
var _elm_lang$html$Html_Events$onWithOptions = _elm_lang$virtual_dom$VirtualDom$onWithOptions;
var _elm_lang$html$Html_Events$on = _elm_lang$virtual_dom$VirtualDom$on;
var _elm_lang$html$Html_Events$onFocus = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'focus',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onBlur = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'blur',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onSubmitOptions = _elm_lang$core$Native_Utils.update(
	_elm_lang$html$Html_Events$defaultOptions,
	{preventDefault: true});
var _elm_lang$html$Html_Events$onSubmit = function (msg) {
	return A3(
		_elm_lang$html$Html_Events$onWithOptions,
		'submit',
		_elm_lang$html$Html_Events$onSubmitOptions,
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onCheck = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'change',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetChecked));
};
var _elm_lang$html$Html_Events$onInput = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'input',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetValue));
};
var _elm_lang$html$Html_Events$onMouseOut = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseout',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseOver = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseover',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseLeave = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseleave',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseEnter = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseenter',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseUp = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseup',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseDown = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mousedown',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onDoubleClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'dblclick',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'click',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});

var _elm_lang$keyboard$Keyboard$onSelfMsg = F3(
	function (router, _p0, state) {
		var _p1 = _p0;
		var _p2 = A2(_elm_lang$core$Dict$get, _p1.category, state);
		if (_p2.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var send = function (tagger) {
				return A2(
					_elm_lang$core$Platform$sendToApp,
					router,
					tagger(_p1.keyCode));
			};
			return A2(
				_elm_lang$core$Task$andThen,
				function (_p3) {
					return _elm_lang$core$Task$succeed(state);
				},
				_elm_lang$core$Task$sequence(
					A2(_elm_lang$core$List$map, send, _p2._0.taggers)));
		}
	});
var _elm_lang$keyboard$Keyboard_ops = _elm_lang$keyboard$Keyboard_ops || {};
_elm_lang$keyboard$Keyboard_ops['&>'] = F2(
	function (task1, task2) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (_p4) {
				return task2;
			},
			task1);
	});
var _elm_lang$keyboard$Keyboard$init = _elm_lang$core$Task$succeed(_elm_lang$core$Dict$empty);
var _elm_lang$keyboard$Keyboard$categorizeHelpHelp = F2(
	function (value, maybeValues) {
		var _p5 = maybeValues;
		if (_p5.ctor === 'Nothing') {
			return _elm_lang$core$Maybe$Just(
				{
					ctor: '::',
					_0: value,
					_1: {ctor: '[]'}
				});
		} else {
			return _elm_lang$core$Maybe$Just(
				{ctor: '::', _0: value, _1: _p5._0});
		}
	});
var _elm_lang$keyboard$Keyboard$categorizeHelp = F2(
	function (subs, subDict) {
		categorizeHelp:
		while (true) {
			var _p6 = subs;
			if (_p6.ctor === '[]') {
				return subDict;
			} else {
				var _v4 = _p6._1,
					_v5 = A3(
					_elm_lang$core$Dict$update,
					_p6._0._0,
					_elm_lang$keyboard$Keyboard$categorizeHelpHelp(_p6._0._1),
					subDict);
				subs = _v4;
				subDict = _v5;
				continue categorizeHelp;
			}
		}
	});
var _elm_lang$keyboard$Keyboard$categorize = function (subs) {
	return A2(_elm_lang$keyboard$Keyboard$categorizeHelp, subs, _elm_lang$core$Dict$empty);
};
var _elm_lang$keyboard$Keyboard$keyCode = A2(_elm_lang$core$Json_Decode$field, 'keyCode', _elm_lang$core$Json_Decode$int);
var _elm_lang$keyboard$Keyboard$subscription = _elm_lang$core$Native_Platform.leaf('Keyboard');
var _elm_lang$keyboard$Keyboard$Watcher = F2(
	function (a, b) {
		return {taggers: a, pid: b};
	});
var _elm_lang$keyboard$Keyboard$Msg = F2(
	function (a, b) {
		return {category: a, keyCode: b};
	});
var _elm_lang$keyboard$Keyboard$onEffects = F3(
	function (router, newSubs, oldState) {
		var rightStep = F3(
			function (category, taggers, task) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (state) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (pid) {
								return _elm_lang$core$Task$succeed(
									A3(
										_elm_lang$core$Dict$insert,
										category,
										A2(_elm_lang$keyboard$Keyboard$Watcher, taggers, pid),
										state));
							},
							_elm_lang$core$Process$spawn(
								A3(
									_elm_lang$dom$Dom_LowLevel$onDocument,
									category,
									_elm_lang$keyboard$Keyboard$keyCode,
									function (_p7) {
										return A2(
											_elm_lang$core$Platform$sendToSelf,
											router,
											A2(_elm_lang$keyboard$Keyboard$Msg, category, _p7));
									})));
					},
					task);
			});
		var bothStep = F4(
			function (category, _p8, taggers, task) {
				var _p9 = _p8;
				return A2(
					_elm_lang$core$Task$map,
					A2(
						_elm_lang$core$Dict$insert,
						category,
						A2(_elm_lang$keyboard$Keyboard$Watcher, taggers, _p9.pid)),
					task);
			});
		var leftStep = F3(
			function (category, _p10, task) {
				var _p11 = _p10;
				return A2(
					_elm_lang$keyboard$Keyboard_ops['&>'],
					_elm_lang$core$Process$kill(_p11.pid),
					task);
			});
		return A6(
			_elm_lang$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			oldState,
			_elm_lang$keyboard$Keyboard$categorize(newSubs),
			_elm_lang$core$Task$succeed(_elm_lang$core$Dict$empty));
	});
var _elm_lang$keyboard$Keyboard$MySub = F2(
	function (a, b) {
		return {ctor: 'MySub', _0: a, _1: b};
	});
var _elm_lang$keyboard$Keyboard$presses = function (tagger) {
	return _elm_lang$keyboard$Keyboard$subscription(
		A2(_elm_lang$keyboard$Keyboard$MySub, 'keypress', tagger));
};
var _elm_lang$keyboard$Keyboard$downs = function (tagger) {
	return _elm_lang$keyboard$Keyboard$subscription(
		A2(_elm_lang$keyboard$Keyboard$MySub, 'keydown', tagger));
};
var _elm_lang$keyboard$Keyboard$ups = function (tagger) {
	return _elm_lang$keyboard$Keyboard$subscription(
		A2(_elm_lang$keyboard$Keyboard$MySub, 'keyup', tagger));
};
var _elm_lang$keyboard$Keyboard$subMap = F2(
	function (func, _p12) {
		var _p13 = _p12;
		return A2(
			_elm_lang$keyboard$Keyboard$MySub,
			_p13._0,
			function (_p14) {
				return func(
					_p13._1(_p14));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Keyboard'] = {pkg: 'elm-lang/keyboard', init: _elm_lang$keyboard$Keyboard$init, onEffects: _elm_lang$keyboard$Keyboard$onEffects, onSelfMsg: _elm_lang$keyboard$Keyboard$onSelfMsg, tag: 'sub', subMap: _elm_lang$keyboard$Keyboard$subMap};



var _user$project$Tightness$removeTightness = _elm_lang$core$Set$remove;
var _user$project$Tightness$addTightness = _elm_lang$core$Set$insert;
var _user$project$Tightness$isTightness = _elm_lang$core$Set$member;
var _user$project$Tightness$updateTightness = F2(
	function (id, model) {
		var _p0 = A2(_user$project$Tightness$isTightness, id, model);
		if (_p0 === true) {
			return A2(_user$project$Tightness$removeTightness, id, model);
		} else {
			return A2(_user$project$Tightness$addTightness, id, model);
		}
	});
var _user$project$Tightness$default = _elm_lang$core$Set$empty;

var _user$project$ElementAttributes$NetworkRole = F2(
	function (a, b) {
		return {network: a, role: b};
	});
var _user$project$ElementAttributes$RoleUnknown = {ctor: 'RoleUnknown'};
var _user$project$ElementAttributes$ProducerConsumer = {ctor: 'ProducerConsumer'};
var _user$project$ElementAttributes$Consumer = {ctor: 'Consumer'};
var _user$project$ElementAttributes$Producer = {ctor: 'Producer'};
var _user$project$ElementAttributes$StateUnknown = {ctor: 'StateUnknown'};
var _user$project$ElementAttributes$HS = {ctor: 'HS'};
var _user$project$ElementAttributes$RAS = {ctor: 'RAS'};

var _user$project$Link$updateActivePoperties = F2(
	function (x, edge) {
		var newParameters = A2(_elm_lang$core$Set$union, edge.parameters, x);
		return _elm_lang$core$Native_Utils.update(
			edge,
			{parameters: newParameters});
	});
var _user$project$Link$unActivate = F2(
	function (x, edge) {
		var new_parameters = A2(_elm_lang$core$Set$remove, x, edge.parameters);
		return _elm_lang$core$Native_Utils.update(
			edge,
			{parameters: new_parameters});
	});
var _user$project$Link$activate = F2(
	function (x, edge) {
		var new_parameters = A2(_elm_lang$core$Set$insert, x, edge.parameters);
		return _elm_lang$core$Native_Utils.update(
			edge,
			{parameters: new_parameters});
	});
var _user$project$Link$isActive = F2(
	function (x, edge) {
		return A2(_elm_lang$core$Set$member, x, edge.parameters);
	});
var _user$project$Link$unActivateProperty = F2(
	function (x, set) {
		return A2(_elm_lang$core$Set$remove, x, set);
	});
var _user$project$Link$activateProperty = F2(
	function (x, set) {
		return A2(_elm_lang$core$Set$insert, x, set);
	});
var _user$project$Link$isActiveProperty = F2(
	function (x, set) {
		return A2(_elm_lang$core$Set$member, x, set);
	});
var _user$project$Link$changeActiveProperty = F2(
	function (x, set) {
		var _p0 = A2(_user$project$Link$isActiveProperty, x, set);
		if (_p0 === false) {
			return A2(_user$project$Link$activateProperty, x, set);
		} else {
			return A2(_user$project$Link$unActivateProperty, x, set);
		}
	});
var _user$project$Link$changeActive = F2(
	function (x, edge) {
		var _p1 = A2(_user$project$Link$isActive, x, edge);
		if (_p1 === false) {
			return A2(_user$project$Link$activate, x, edge);
		} else {
			return A2(_user$project$Link$unActivate, x, edge);
		}
	});
var _user$project$Link$isEqual = F2(
	function (x, e) {
		return (_elm_lang$core$Native_Utils.eq(x.source, e.source) && _elm_lang$core$Native_Utils.eq(x.target, e.target)) || (_elm_lang$core$Native_Utils.eq(x.source, e.target) && _elm_lang$core$Native_Utils.eq(x.target, e.source));
	});
var _user$project$Link$makeLink = F3(
	function (i, s, t) {
		return {id: i, source: s, target: t, parameters: _elm_lang$core$Set$empty, state: _user$project$ElementAttributes$RAS, attribut: _elm_lang$core$Maybe$Nothing, highLighted: 0, tightness: _user$project$Tightness$default};
	});
var _user$project$Link$link = F2(
	function (s, t) {
		return A3(_user$project$Link$makeLink, 0, s, t);
	});
var _user$project$Link$Edge = F8(
	function (a, b, c, d, e, f, g, h) {
		return {id: a, source: b, target: c, parameters: d, state: e, attribut: f, highLighted: g, tightness: h};
	});

var _user$project$Position$defaultPosition = {x: 0, y: 0};
var _user$project$Position$Position = F2(
	function (a, b) {
		return {x: a, y: b};
	});
var _user$project$Position$NodePosition = F2(
	function (a, b) {
		return {id: a, position: b};
	});

var _user$project$LinkParameters$property = F2(
	function (i, s) {
		return {id: i, name: s};
	});
var _user$project$LinkParameters$sampleModel = {
	ctor: '::',
	_0: {id: 0, name: 'Air'},
	_1: {
		ctor: '::',
		_0: {id: 1, name: 'Fresh Water'},
		_1: {
			ctor: '::',
			_0: {id: 2, name: 'Salt Water'},
			_1: {
				ctor: '::',
				_0: {id: 3, name: '400 V AC'},
				_1: {
					ctor: '::',
					_0: {id: 4, name: '230 V AC'},
					_1: {
						ctor: '::',
						_0: {id: 5, name: '48 V DC'},
						_1: {
							ctor: '::',
							_0: {id: 6, name: 'Command & Control'},
							_1: {ctor: '[]'}
						}
					}
				}
			}
		}
	}
};
var _user$project$LinkParameters$defaultModel = {ctor: '[]'};
var _user$project$LinkParameters$getPropertyFromName = F2(
	function (s, list) {
		getPropertyFromName:
		while (true) {
			var _p0 = list;
			if (_p0.ctor === '[]') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p2 = _p0._0;
				var _p1 = _elm_lang$core$Native_Utils.eq(_p2.name, s);
				if (_p1 === true) {
					return _elm_lang$core$Maybe$Just(_p2);
				} else {
					var _v2 = s,
						_v3 = _p0._1;
					s = _v2;
					list = _v3;
					continue getPropertyFromName;
				}
			}
		}
	});
var _user$project$LinkParameters$getPropertyNameFromId = F2(
	function (id, parameters) {
		getPropertyNameFromId:
		while (true) {
			var _p3 = parameters;
			if (_p3.ctor === '[]') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p5 = _p3._0;
				var _p4 = _elm_lang$core$Native_Utils.eq(_p5.id, id);
				if (_p4 === true) {
					return _elm_lang$core$Maybe$Just(_p5.name);
				} else {
					var _v6 = id,
						_v7 = _p3._1;
					id = _v6;
					parameters = _v7;
					continue getPropertyNameFromId;
				}
			}
		}
	});
var _user$project$LinkParameters$getPropertyIdFromName = F2(
	function (s, list) {
		getPropertyIdFromName:
		while (true) {
			var _p6 = list;
			if (_p6.ctor === '[]') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p8 = _p6._0;
				var _p7 = _elm_lang$core$Native_Utils.eq(_p8.name, s);
				if (_p7 === true) {
					return _elm_lang$core$Maybe$Just(_p8.id);
				} else {
					var _v10 = s,
						_v11 = _p6._1;
					s = _v10;
					list = _v11;
					continue getPropertyIdFromName;
				}
			}
		}
	});
var _user$project$LinkParameters$Property = F2(
	function (a, b) {
		return {id: a, name: b};
	});

var _user$project$Node$initRoles = F2(
	function (node, parameters) {
		var parameterIds = A2(
			_elm_lang$core$List$map,
			function (_) {
				return _.id;
			},
			parameters);
		var roles = A2(
			_elm_lang$core$List$map,
			function (parameterId) {
				return {network: parameterId, role: _user$project$ElementAttributes$RoleUnknown};
			},
			parameterIds);
		return _elm_lang$core$Native_Utils.update(
			node,
			{roles: roles});
	});
var _user$project$Node$blow = function (n) {
	return _elm_lang$core$Native_Utils.update(
		n,
		{blow: !n.blow});
};
var _user$project$Node$removeGeometry = F2(
	function (s, n) {
		return _elm_lang$core$Native_Utils.update(
			n,
			{geometry: _elm_lang$core$Maybe$Nothing});
	});
var _user$project$Node$hasGeometry = F2(
	function (s, n) {
		var _p0 = n.geometry;
		if (_p0.ctor === 'Nothing') {
			return false;
		} else {
			return _elm_lang$core$Native_Utils.eq(_p0._0, s);
		}
	});
var _user$project$Node$inGroup = F2(
	function (s, n) {
		return A2(_elm_lang$core$Set$member, s, n.group);
	});
var _user$project$Node$node = F3(
	function (id, name, parent) {
		return {
			id: id,
			name: name,
			parent: parent,
			attribut: _elm_lang$core$Maybe$Nothing,
			state: _user$project$ElementAttributes$RAS,
			roles: {ctor: '[]'},
			geometry: _elm_lang$core$Maybe$Nothing,
			group: _elm_lang$core$Set$empty,
			highLighted: 0,
			position: _user$project$Position$defaultPosition,
			blow: false
		};
	});
var _user$project$Node$Node = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return {id: a, name: b, parent: c, attribut: d, state: e, roles: f, geometry: g, group: h, highLighted: i, position: j, blow: k};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};

var _user$project$Groups$getPropertyFromName = F2(
	function (s, list) {
		getPropertyFromName:
		while (true) {
			var _p0 = list;
			if (_p0.ctor === '[]') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p2 = _p0._0;
				var _p1 = _elm_lang$core$Native_Utils.eq(_p2.name, s);
				if (_p1 === true) {
					return _elm_lang$core$Maybe$Just(_p2);
				} else {
					var _v2 = s,
						_v3 = _p0._1;
					s = _v2;
					list = _v3;
					continue getPropertyFromName;
				}
			}
		}
	});
var _user$project$Groups$getPropertyIdFromName = F2(
	function (s, list) {
		getPropertyIdFromName:
		while (true) {
			var _p3 = list;
			if (_p3.ctor === '[]') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p5 = _p3._0;
				var _p4 = _elm_lang$core$Native_Utils.eq(_p5.name, s);
				if (_p4 === true) {
					return _elm_lang$core$Maybe$Just(_p5.id);
				} else {
					var _v6 = s,
						_v7 = _p3._1;
					s = _v6;
					list = _v7;
					continue getPropertyIdFromName;
				}
			}
		}
	});
var _user$project$Groups$getPropertyStringFromId = F2(
	function (id, list) {
		getPropertyStringFromId:
		while (true) {
			var _p6 = list;
			if (_p6.ctor === '[]') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p8 = _p6._0;
				var _p7 = _elm_lang$core$Native_Utils.eq(_p8.id, id);
				if (_p7 === true) {
					return _elm_lang$core$Maybe$Just(_p8.name);
				} else {
					var _v10 = id,
						_v11 = _p6._1;
					id = _v10;
					list = _v11;
					continue getPropertyStringFromId;
				}
			}
		}
	});
var _user$project$Groups$property = F2(
	function (i, s) {
		return {id: i, name: s};
	});
var _user$project$Groups$defaultModel = {ctor: '[]'};
var _user$project$Groups$Property = F2(
	function (a, b) {
		return {id: a, name: b};
	});

var _user$project$TightnessActions$removeAllTightness = F2(
	function (id, edges) {
		return A2(
			_elm_lang$core$List$map,
			function (x) {
				return _elm_lang$core$Native_Utils.update(
					x,
					{
						tightness: A2(_user$project$Tightness$removeTightness, id, x.tightness)
					});
			},
			edges);
	});
var _user$project$TightnessActions$updateTightnessForEdgeId = F3(
	function (id, edgeId, edges) {
		return A2(
			_elm_lang$core$List$map,
			function (x) {
				var _p0 = _elm_lang$core$Native_Utils.eq(x.id, edgeId);
				if (_p0 === false) {
					return x;
				} else {
					return _elm_lang$core$Native_Utils.update(
						x,
						{
							tightness: A2(_user$project$Tightness$updateTightness, id, x.tightness)
						});
				}
			},
			edges);
	});

var _user$project$Layout$NodeLayout = F2(
	function (a, b) {
		return {id: a, layout: b};
	});
var _user$project$Layout$GeometryLayout = F2(
	function (a, b) {
		return {id: a, layout: b};
	});

var _user$project$Mask$insert = _elm_lang$core$Set$insert;
var _user$project$Mask$remove = _elm_lang$core$Set$remove;
var _user$project$Mask$member = _elm_lang$core$Set$member;
var _user$project$Mask$defaultModel = _elm_lang$core$Set$empty;

var _user$project$Geometries$getPropertyFromId = F2(
	function (id, list) {
		getPropertyFromId:
		while (true) {
			var _p0 = list;
			if (_p0.ctor === '[]') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p2 = _p0._0;
				var _p1 = _elm_lang$core$Native_Utils.eq(_p2.id, id);
				if (_p1 === true) {
					return _elm_lang$core$Maybe$Just(_p2);
				} else {
					var _v2 = id,
						_v3 = _p0._1;
					id = _v2;
					list = _v3;
					continue getPropertyFromId;
				}
			}
		}
	});
var _user$project$Geometries$getImageFromId = F2(
	function (id, list) {
		var _p3 = A2(_user$project$Geometries$getPropertyFromId, id, list);
		if (_p3.ctor === 'Nothing') {
			return _elm_lang$core$Maybe$Nothing;
		} else {
			return _p3._0.svg;
		}
	});
var _user$project$Geometries$getPropertyIdFromName = F2(
	function (s, list) {
		getPropertyIdFromName:
		while (true) {
			var _p4 = list;
			if (_p4.ctor === '[]') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p6 = _p4._0;
				var _p5 = _elm_lang$core$Native_Utils.eq(_p6.name, s);
				if (_p5 === true) {
					return _elm_lang$core$Maybe$Just(_p6.id);
				} else {
					var _v7 = s,
						_v8 = _p4._1;
					s = _v7;
					list = _v8;
					continue getPropertyIdFromName;
				}
			}
		}
	});
var _user$project$Geometries$getPropertyStringFromId = F2(
	function (id, list) {
		var _p7 = list;
		if (_p7.ctor === '[]') {
			return _elm_lang$core$Maybe$Nothing;
		} else {
			var _p9 = _p7._0;
			var _p8 = _elm_lang$core$Native_Utils.eq(_p9.id, id);
			if (_p8 === true) {
				return _elm_lang$core$Maybe$Just(_p9.name);
			} else {
				return _elm_lang$core$Maybe$Nothing;
			}
		}
	});
var _user$project$Geometries$property = F2(
	function (i, s) {
		return {id: i, name: s, svg: _elm_lang$core$Maybe$Nothing};
	});
var _user$project$Geometries$defaultModel = {ctor: '[]'};
var _user$project$Geometries$Property = F3(
	function (a, b, c) {
		return {id: a, name: b, svg: c};
	});

var _user$project$DataModel$deleteGeometry = F2(
	function (s, model) {
		var maybe_geometry = A2(_user$project$Geometries$getPropertyIdFromName, s, model.geometries);
		var newModel = function () {
			var _p0 = maybe_geometry;
			if (_p0.ctor === 'Nothing') {
				return model;
			} else {
				var _p1 = _p0._0;
				var newNodes = A2(
					_elm_lang$core$List$map,
					function (x) {
						return A2(_user$project$Node$removeGeometry, _p1, x);
					},
					model.nodes);
				var newGeometries = A2(
					_elm_lang$core$List$filter,
					function (x) {
						return !_elm_lang$core$Native_Utils.eq(x.id, _p1);
					},
					model.geometries);
				return _elm_lang$core$Native_Utils.update(
					model,
					{geometries: newGeometries, nodes: newNodes});
			}
		}();
		return newModel;
	});
var _user$project$DataModel$getCurIdFromDataModel = function (dm) {
	var gMax = A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$Basics$max,
		0,
		A2(
			_elm_lang$core$List$map,
			function (x) {
				return x.id;
			},
			dm.groups));
	var pMax = A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$Basics$max,
		0,
		A2(
			_elm_lang$core$List$map,
			function (x) {
				return x.id;
			},
			dm.parameters));
	var eMax = A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$Basics$max,
		0,
		A2(
			_elm_lang$core$List$map,
			function (x) {
				return x.data.id;
			},
			dm.edges));
	var nMax = A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$Basics$max,
		0,
		A2(
			_elm_lang$core$List$map,
			function (x) {
				return x.data.id;
			},
			dm.nodes));
	var iMax = A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$Basics$max,
		0,
		{
			ctor: '::',
			_0: gMax,
			_1: {
				ctor: '::',
				_0: pMax,
				_1: {
					ctor: '::',
					_0: eMax,
					_1: {
						ctor: '::',
						_0: nMax,
						_1: {ctor: '[]'}
					}
				}
			}
		});
	return iMax;
};
var _user$project$DataModel$getCurIdFromModel = function (model) {
	var gMax = A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$Basics$max,
		0,
		A2(
			_elm_lang$core$List$map,
			function (x) {
				return x.id;
			},
			model.groups));
	var pMax = A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$Basics$max,
		0,
		A2(
			_elm_lang$core$List$map,
			function (x) {
				return x.id;
			},
			model.parameters));
	var eMax = A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$Basics$max,
		0,
		A2(
			_elm_lang$core$List$map,
			function (x) {
				return x.id;
			},
			model.edges));
	var nMax = A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$Basics$max,
		0,
		A2(
			_elm_lang$core$List$map,
			function (x) {
				return x.id;
			},
			model.nodes));
	var iMax = A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$Basics$max,
		0,
		{
			ctor: '::',
			_0: gMax,
			_1: {
				ctor: '::',
				_0: pMax,
				_1: {
					ctor: '::',
					_0: eMax,
					_1: {
						ctor: '::',
						_0: nMax,
						_1: {ctor: '[]'}
					}
				}
			}
		});
	return iMax;
};
var _user$project$DataModel$triNodes = function (model) {
	return model;
};
var _user$project$DataModel$isLayoutPresent = F2(
	function (id, list) {
		isLayoutPresent:
		while (true) {
			var _p2 = list;
			if (_p2.ctor === '[]') {
				return false;
			} else {
				var _p3 = _elm_lang$core$Native_Utils.eq(_p2._0.id, id);
				if (_p3 === true) {
					return true;
				} else {
					var _v3 = id,
						_v4 = _p2._1;
					id = _v3;
					list = _v4;
					continue isLayoutPresent;
				}
			}
		}
	});
var _user$project$DataModel$getLayoutFromNodeIdAndList_ = F2(
	function (id, list) {
		getLayoutFromNodeIdAndList_:
		while (true) {
			var _p4 = list;
			if (_p4.ctor === '[]') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p6 = _p4._0;
				var _p5 = _elm_lang$core$Native_Utils.eq(_p6.id, id);
				if (_p5 === true) {
					return _elm_lang$core$Maybe$Just(_p6.layout);
				} else {
					var _v7 = id,
						_v8 = _p4._1;
					id = _v7;
					list = _v8;
					continue getLayoutFromNodeIdAndList_;
				}
			}
		}
	});
var _user$project$DataModel$getLayoutFromNodeId = F2(
	function (id, model) {
		return A2(_user$project$DataModel$getLayoutFromNodeIdAndList_, id, model.layouts);
	});
var _user$project$DataModel$getGeometryLayoutFromId = F2(
	function (id, model) {
		return A2(_user$project$DataModel$getLayoutFromNodeIdAndList_, id, model.geometryLayouts);
	});
var _user$project$DataModel$nodeListSameParent_ = F3(
	function (list, m_p, b) {
		var _p7 = list;
		if (_p7.ctor === '[]') {
			return {ctor: '_Tuple2', _0: b, _1: m_p};
		} else {
			var res = function () {
				var _p8 = _elm_lang$core$Native_Utils.eq(m_p, _p7._0.parent);
				if (_p8 === false) {
					return {ctor: '_Tuple2', _0: false, _1: m_p};
				} else {
					return A3(_user$project$DataModel$nodeListSameParent_, _p7._1, m_p, true);
				}
			}();
			return res;
		}
	});
var _user$project$DataModel$nodeListSameParent = function (list) {
	var _p9 = list;
	if (_p9.ctor === '[]') {
		return {ctor: '_Tuple2', _0: false, _1: _elm_lang$core$Maybe$Nothing};
	} else {
		return A3(_user$project$DataModel$nodeListSameParent_, _p9._1, _p9._0.parent, true);
	}
};
var _user$project$DataModel$bros = F2(
	function (n, list) {
		return A2(
			_elm_lang$core$List$filter,
			function (x) {
				return (!_elm_lang$core$Native_Utils.eq(x.id, n.id)) && _elm_lang$core$Native_Utils.eq(x.parent, n.parent);
			},
			list);
	});
var _user$project$DataModel$childs = F2(
	function (n, list) {
		return A2(
			_elm_lang$core$List$filter,
			function (x) {
				return _elm_lang$core$Native_Utils.eq(
					x.parent,
					_elm_lang$core$Maybe$Just(n.id));
			},
			list);
	});
var _user$project$DataModel$triOneNode_ = F2(
	function (list, model) {
		var _p10 = list;
		if (_p10.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			var _p11 = _p10._0;
			var lx = A2(
				_elm_lang$core$Basics_ops['++'],
				{
					ctor: '::',
					_0: _p11,
					_1: {ctor: '[]'}
				},
				A2(
					_user$project$DataModel$triOneNode_,
					A2(_user$project$DataModel$childs, _p11, model.nodes),
					model));
			return A2(
				_elm_lang$core$List$append,
				lx,
				A2(_user$project$DataModel$triOneNode_, _p10._1, model));
		}
	});
var _user$project$DataModel$edgeST = F2(
	function (n, m) {
		return A2(_user$project$Link$link, n.id, m.id);
	});
var _user$project$DataModel$isEdgePresent = F2(
	function (e, list) {
		isEdgePresent:
		while (true) {
			var _p12 = list;
			if (_p12.ctor === '[]') {
				return false;
			} else {
				var _p13 = A2(_user$project$Link$isEqual, _p12._0, e);
				if (_p13 === true) {
					return true;
				} else {
					var _v15 = e,
						_v16 = _p12._1;
					e = _v15;
					list = _v16;
					continue isEdgePresent;
				}
			}
		}
	});
var _user$project$DataModel$anyEdgeDoublon = function (list) {
	anyEdgeDoublon:
	while (true) {
		var _p14 = list;
		if (_p14.ctor === '[]') {
			return false;
		} else {
			var _p16 = _p14._1;
			var _p15 = A2(_user$project$DataModel$isEdgePresent, _p14._0, _p16);
			if (_p15 === true) {
				return true;
			} else {
				var _v19 = _p16;
				list = _v19;
				continue anyEdgeDoublon;
			}
		}
	}
};
var _user$project$DataModel$anyLink = F3(
	function (list, n, edges) {
		anyLink:
		while (true) {
			var _p17 = list;
			if (_p17.ctor === '[]') {
				return false;
			} else {
				var _p18 = A2(
					_user$project$DataModel$isEdgePresent,
					A2(_user$project$Link$link, _p17._0.id, n.id),
					edges);
				if (_p18 === true) {
					return true;
				} else {
					var _v22 = _p17._1,
						_v23 = n,
						_v24 = edges;
					list = _v22;
					n = _v23;
					edges = _v24;
					continue anyLink;
				}
			}
		}
	});
var _user$project$DataModel$anyLinks = F3(
	function (l1, list, edges) {
		anyLinks:
		while (true) {
			var _p19 = list;
			if (_p19.ctor === '[]') {
				return false;
			} else {
				var _p20 = A3(_user$project$DataModel$anyLink, l1, _p19._0, edges);
				if (_p20 === true) {
					return true;
				} else {
					var _v27 = l1,
						_v28 = _p19._1,
						_v29 = edges;
					l1 = _v27;
					list = _v28;
					edges = _v29;
					continue anyLinks;
				}
			}
		}
	});
var _user$project$DataModel$isIdPresentInList = F2(
	function (id, list) {
		isIdPresentInList:
		while (true) {
			var _p21 = list;
			if (_p21.ctor === '::') {
				var _p22 = _elm_lang$core$Native_Utils.eq(_p21._0, id);
				if (_p22 === true) {
					return true;
				} else {
					var _v32 = id,
						_v33 = _p21._1;
					id = _v32;
					list = _v33;
					continue isIdPresentInList;
				}
			} else {
				return false;
			}
		}
	});
var _user$project$DataModel$isNodePresent = F2(
	function (n, list) {
		isNodePresent:
		while (true) {
			var _p23 = list;
			if (_p23.ctor === '::') {
				var _p24 = _elm_lang$core$Native_Utils.eq(_p23._0.id, n.id);
				if (_p24 === true) {
					return true;
				} else {
					var _v36 = n,
						_v37 = _p23._1;
					n = _v36;
					list = _v37;
					continue isNodePresent;
				}
			} else {
				return false;
			}
		}
	});
var _user$project$DataModel$triN = F3(
	function (list, todo, model) {
		triN:
		while (true) {
			var _p25 = todo;
			if (_p25.ctor === '[]') {
				return list;
			} else {
				var _p28 = _p25._1;
				var _p27 = _p25._0;
				var _p26 = A2(_user$project$DataModel$isNodePresent, _p27, list);
				if (_p26 === true) {
					var _v40 = list,
						_v41 = _p28,
						_v42 = model;
					list = _v40;
					todo = _v41;
					model = _v42;
					continue triN;
				} else {
					var _v43 = A2(
						_elm_lang$core$List$append,
						list,
						A2(
							_user$project$DataModel$triOneNode_,
							{
								ctor: '::',
								_0: _p27,
								_1: {ctor: '[]'}
							},
							model)),
						_v44 = _p28,
						_v45 = model;
					list = _v43;
					todo = _v44;
					model = _v45;
					continue triN;
				}
			}
		}
	});
var _user$project$DataModel$isNamePresent = F2(
	function (s, l) {
		isNamePresent:
		while (true) {
			var _p29 = l;
			if (_p29.ctor === '::') {
				var _p30 = _elm_lang$core$Native_Utils.eq(_p29._0.name, s);
				if (_p30 === true) {
					return true;
				} else {
					var _v48 = s,
						_v49 = _p29._1;
					s = _v48;
					l = _v49;
					continue isNamePresent;
				}
			} else {
				return false;
			}
		}
	});
var _user$project$DataModel$isNodeIdPresent = F2(
	function (id, list) {
		isNodeIdPresent:
		while (true) {
			var _p31 = list;
			if (_p31.ctor === '::') {
				var _p32 = _elm_lang$core$Native_Utils.eq(_p31._0.id, id);
				if (_p32 === true) {
					return true;
				} else {
					var _v52 = id,
						_v53 = _p31._1;
					id = _v52;
					list = _v53;
					continue isNodeIdPresent;
				}
			} else {
				return false;
			}
		}
	});
var _user$project$DataModel$deleteGroupProperty = F2(
	function (s, model) {
		var maybe_group = A2(_user$project$Groups$getPropertyFromName, s, model.groups);
		var newModel = function () {
			var _p33 = maybe_group;
			if (_p33.ctor === 'Nothing') {
				return model;
			} else {
				var _p34 = _p33._0;
				var newEdges = A2(_user$project$TightnessActions$removeAllTightness, _p34.id, model.edges);
				var newNodes = A2(
					_elm_lang$core$List$map,
					function (x) {
						return _elm_lang$core$Native_Utils.update(
							x,
							{
								group: A2(_elm_lang$core$Set$remove, _p34.id, x.group)
							});
					},
					model.nodes);
				var newGroups = A2(
					_elm_lang$core$List$filter,
					function (x) {
						return !_elm_lang$core$Native_Utils.eq(x, _p34);
					},
					model.groups);
				return _elm_lang$core$Native_Utils.update(
					model,
					{groups: newGroups, nodes: newNodes, edges: newEdges});
			}
		}();
		return newModel;
	});
var _user$project$DataModel$removeNetworkFromRoles = F2(
	function (parameter, node) {
		var roles = A2(
			_elm_lang$core$List$filter,
			function (role) {
				return !_elm_lang$core$Native_Utils.eq(role.network, parameter.id);
			},
			node.roles);
		return _elm_lang$core$Native_Utils.update(
			node,
			{roles: roles});
	});
var _user$project$DataModel$deleteProperty = F2(
	function (s, model) {
		var maybe_param = A2(_user$project$LinkParameters$getPropertyFromName, s, model.parameters);
		var newModel = function () {
			var _p35 = maybe_param;
			if (_p35.ctor === 'Nothing') {
				return model;
			} else {
				var _p36 = _p35._0;
				var nodes = A2(
					_elm_lang$core$List$map,
					_user$project$DataModel$removeNetworkFromRoles(_p36),
					model.nodes);
				var newParameters = A2(
					_elm_lang$core$List$filter,
					function (x) {
						return !_elm_lang$core$Native_Utils.eq(x, _p36);
					},
					model.parameters);
				return _elm_lang$core$Native_Utils.update(
					model,
					{parameters: newParameters, nodes: nodes});
			}
		}();
		return newModel;
	});
var _user$project$DataModel$addNetworkToRoles = F2(
	function (parameter, node) {
		var newRole = {network: parameter.id, role: _user$project$ElementAttributes$RoleUnknown};
		var roles = A2(
			_elm_lang$core$Basics_ops['++'],
			node.roles,
			{
				ctor: '::',
				_0: newRole,
				_1: {ctor: '[]'}
			});
		return _elm_lang$core$Native_Utils.update(
			node,
			{roles: roles});
	});
var _user$project$DataModel$nodeHasParent = function (n) {
	var _p37 = n.parent;
	if (_p37.ctor === 'Nothing') {
		return false;
	} else {
		return true;
	}
};
var _user$project$DataModel$getNodeIdFromName = F2(
	function (s, list) {
		getNodeIdFromName:
		while (true) {
			var _p38 = list;
			if (_p38.ctor === '::') {
				var _p40 = _p38._0;
				var _p39 = _elm_lang$core$Native_Utils.eq(_p40.name, s);
				if (_p39 === true) {
					return _elm_lang$core$Maybe$Just(_p40.id);
				} else {
					var _v59 = s,
						_v60 = _p38._1;
					s = _v59;
					list = _v60;
					continue getNodeIdFromName;
				}
			} else {
				return _elm_lang$core$Maybe$Nothing;
			}
		}
	});
var _user$project$DataModel$getNodeNameFromId = F2(
	function (id, list) {
		getNodeNameFromId:
		while (true) {
			var _p41 = list;
			if (_p41.ctor === '::') {
				var _p43 = _p41._0;
				var _p42 = _elm_lang$core$Native_Utils.eq(_p43.id, id);
				if (_p42 === true) {
					return _elm_lang$core$Maybe$Just(_p43.name);
				} else {
					var _v63 = id,
						_v64 = _p41._1;
					id = _v63;
					list = _v64;
					continue getNodeNameFromId;
				}
			} else {
				return _elm_lang$core$Maybe$Nothing;
			}
		}
	});
var _user$project$DataModel$getNodeFromName = F2(
	function (s, list) {
		getNodeFromName:
		while (true) {
			var _p44 = list;
			if (_p44.ctor === '::') {
				var _p46 = _p44._0;
				var _p45 = _elm_lang$core$Native_Utils.eq(_p46.name, s);
				if (_p45 === true) {
					return _elm_lang$core$Maybe$Just(_p46);
				} else {
					var _v67 = s,
						_v68 = _p44._1;
					s = _v67;
					list = _v68;
					continue getNodeFromName;
				}
			} else {
				return _elm_lang$core$Maybe$Nothing;
			}
		}
	});
var _user$project$DataModel$getNodeIdFromNameAndParent = F3(
	function (s, m_p, list) {
		getNodeIdFromNameAndParent:
		while (true) {
			var _p47 = list;
			if (_p47.ctor === '::') {
				var _p49 = _p47._0;
				var _p48 = _elm_lang$core$Native_Utils.eq(_p49.name, s) && _elm_lang$core$Native_Utils.eq(_p49.parent, m_p);
				if (_p48 === true) {
					return _elm_lang$core$Maybe$Just(_p49.id);
				} else {
					var _v71 = s,
						_v72 = m_p,
						_v73 = _p47._1;
					s = _v71;
					m_p = _v72;
					list = _v73;
					continue getNodeIdFromNameAndParent;
				}
			} else {
				return _elm_lang$core$Maybe$Nothing;
			}
		}
	});
var _user$project$DataModel$getNodeFromNameAndParent = F3(
	function (s, m_p, list) {
		getNodeFromNameAndParent:
		while (true) {
			var _p50 = list;
			if (_p50.ctor === '::') {
				var _p52 = _p50._0;
				var _p51 = _elm_lang$core$Native_Utils.eq(_p52.name, s) && _elm_lang$core$Native_Utils.eq(_p52.parent, m_p);
				if (_p51 === true) {
					return _elm_lang$core$Maybe$Just(_p52);
				} else {
					var _v76 = s,
						_v77 = m_p,
						_v78 = _p50._1;
					s = _v76;
					m_p = _v77;
					list = _v78;
					continue getNodeFromNameAndParent;
				}
			} else {
				return _elm_lang$core$Maybe$Nothing;
			}
		}
	});
var _user$project$DataModel$getEdgeFromNodesId = F3(
	function (ids, idt, list) {
		getEdgeFromNodesId:
		while (true) {
			var _p53 = list;
			if (_p53.ctor === '::') {
				var _p55 = _p53._0;
				var _p54 = (_elm_lang$core$Native_Utils.eq(_p55.source, ids) && _elm_lang$core$Native_Utils.eq(_p55.target, idt)) || (_elm_lang$core$Native_Utils.eq(_p55.source, idt) && _elm_lang$core$Native_Utils.eq(_p55.target, ids));
				if (_p54 === true) {
					return _elm_lang$core$Maybe$Just(_p55);
				} else {
					var _v81 = ids,
						_v82 = idt,
						_v83 = _p53._1;
					ids = _v81;
					idt = _v82;
					list = _v83;
					continue getEdgeFromNodesId;
				}
			} else {
				return _elm_lang$core$Maybe$Nothing;
			}
		}
	});
var _user$project$DataModel$getEdgeIdFromNodesId = F3(
	function (ids, idt, list) {
		var _p56 = A3(_user$project$DataModel$getEdgeFromNodesId, ids, idt, list);
		if (_p56.ctor === 'Nothing') {
			return _elm_lang$core$Maybe$Nothing;
		} else {
			return _elm_lang$core$Maybe$Just(_p56._0.id);
		}
	});
var _user$project$DataModel$getEdgeFromNodesName = F3(
	function (src, target, model) {
		var m_ntarget = A2(_user$project$DataModel$getNodeFromName, target, model.nodes);
		var m_nsrc = A2(_user$project$DataModel$getNodeFromName, src, model.nodes);
		var m_edge = function () {
			var _p57 = {ctor: '_Tuple2', _0: m_nsrc, _1: m_ntarget};
			if (((_p57.ctor === '_Tuple2') && (_p57._0.ctor === 'Just')) && (_p57._1.ctor === 'Just')) {
				return A3(_user$project$DataModel$getEdgeFromNodesId, _p57._0._0.id, _p57._1._0.id, model.edges);
			} else {
				return _elm_lang$core$Maybe$Nothing;
			}
		}();
		return m_edge;
	});
var _user$project$DataModel$anyLinkParameter = F4(
	function (idx, list, n, edges) {
		var _p58 = list;
		if (_p58.ctor === '[]') {
			return false;
		} else {
			var m_edge = A3(_user$project$DataModel$getEdgeFromNodesId, _p58._0.id, n.id, edges);
			var b = function () {
				var _p59 = m_edge;
				if (_p59.ctor === 'Nothing') {
					return false;
				} else {
					return A2(_user$project$Link$isActive, idx, _p59._0);
				}
			}();
			var b1 = function () {
				var _p60 = b;
				if (_p60 === true) {
					return true;
				} else {
					return A4(_user$project$DataModel$anyLinkParameter, idx, _p58._1, n, edges);
				}
			}();
			return b1;
		}
	});
var _user$project$DataModel$anyLinksParameter = F4(
	function (idx, l1, list, edges) {
		anyLinksParameter:
		while (true) {
			var _p61 = list;
			if (_p61.ctor === '[]') {
				return false;
			} else {
				var _p62 = A4(_user$project$DataModel$anyLinkParameter, idx, l1, _p61._0, edges);
				if (_p62 === true) {
					return true;
				} else {
					var _v91 = idx,
						_v92 = l1,
						_v93 = _p61._1,
						_v94 = edges;
					idx = _v91;
					l1 = _v92;
					list = _v93;
					edges = _v94;
					continue anyLinksParameter;
				}
			}
		}
	});
var _user$project$DataModel$getEdgeFromId = F2(
	function (id, list) {
		getEdgeFromId:
		while (true) {
			var _p63 = list;
			if (_p63.ctor === '::') {
				var _p65 = _p63._0;
				var _p64 = _elm_lang$core$Native_Utils.eq(_p65.id, id);
				if (_p64 === true) {
					return _elm_lang$core$Maybe$Just(_p65);
				} else {
					var _v97 = id,
						_v98 = _p63._1;
					id = _v97;
					list = _v98;
					continue getEdgeFromId;
				}
			} else {
				return _elm_lang$core$Maybe$Nothing;
			}
		}
	});
var _user$project$DataModel$getNodeFromId = F2(
	function (id, list) {
		getNodeFromId:
		while (true) {
			var _p66 = list;
			if (_p66.ctor === '::') {
				var _p68 = _p66._0;
				var _p67 = _elm_lang$core$Native_Utils.eq(_p68.id, id);
				if (_p67 === true) {
					return _elm_lang$core$Maybe$Just(_p68);
				} else {
					var _v101 = id,
						_v102 = _p66._1;
					id = _v101;
					list = _v102;
					continue getNodeFromId;
				}
			} else {
				return _elm_lang$core$Maybe$Nothing;
			}
		}
	});
var _user$project$DataModel$getParentFromNodeId = F2(
	function (maybe_idx, nodes) {
		var _p69 = maybe_idx;
		if (_p69.ctor === 'Nothing') {
			return _elm_lang$core$Maybe$Nothing;
		} else {
			var maybe_n = A2(_user$project$DataModel$getNodeFromId, _p69._0, nodes);
			var parent = function () {
				var _p70 = maybe_n;
				if (_p70.ctor === 'Nothing') {
					return _elm_lang$core$Maybe$Nothing;
				} else {
					return _p70._0.parent;
				}
			}();
			return parent;
		}
	});
var _user$project$DataModel$setLayoutToNodes = F2(
	function (layout, model) {
		setLayoutToNodes:
		while (true) {
			var _p71 = layout;
			if (_p71.ctor === '[]') {
				return model;
			} else {
				var _p74 = _p71._0;
				var m_n = A2(_user$project$DataModel$getNodeFromId, _p74.id, model.nodes);
				var newModel = function () {
					var _p72 = m_n;
					if (_p72.ctor === 'Nothing') {
						return model;
					} else {
						var newNodes = A2(
							_elm_lang$core$List$map,
							function (u) {
								var _p73 = _elm_lang$core$Native_Utils.eq(u.id, _p72._0.id);
								if (_p73 === true) {
									return _elm_lang$core$Native_Utils.update(
										u,
										{position: _p74.position});
								} else {
									return u;
								}
							},
							model.nodes);
						return _elm_lang$core$Native_Utils.update(
							model,
							{nodes: newNodes});
					}
				}();
				var _v108 = _p71._1,
					_v109 = newModel;
				layout = _v108;
				model = _v109;
				continue setLayoutToNodes;
			}
		}
	});
var _user$project$DataModel$getNodeListFromName = F2(
	function (s, list) {
		return A2(
			_elm_lang$core$List$filter,
			function (x) {
				return _elm_lang$core$Native_Utils.eq(x.name, s);
			},
			list);
	});
var _user$project$DataModel$getNodeIdentifier = function (model) {
	var newId = model.curNodeId + 1;
	return _elm_lang$core$Native_Utils.update(
		model,
		{curNodeId: newId});
};
var _user$project$DataModel$createProperty_ = F2(
	function (s, model) {
		var m1 = _user$project$DataModel$getNodeIdentifier(model);
		var parameter = A2(_user$project$LinkParameters$property, m1.curNodeId, s);
		var newParameters = {ctor: '::', _0: parameter, _1: m1.parameters};
		var nodes = A2(
			_elm_lang$core$List$map,
			_user$project$DataModel$addNetworkToRoles(parameter),
			m1.nodes);
		return _elm_lang$core$Native_Utils.update(
			m1,
			{parameters: newParameters, nodes: nodes});
	});
var _user$project$DataModel$createProperty = F2(
	function (s, model) {
		var _p75 = A2(_user$project$LinkParameters$getPropertyIdFromName, s, model.parameters);
		if (_p75.ctor === 'Nothing') {
			return A2(_user$project$DataModel$createProperty_, s, model);
		} else {
			return model;
		}
	});
var _user$project$DataModel$createGroupProperty = F2(
	function (s, model) {
		var m1 = _user$project$DataModel$getNodeIdentifier(model);
		var fc = A2(_user$project$Groups$property, m1.curNodeId, s);
		var newGroups = {ctor: '::', _0: fc, _1: m1.groups};
		return _elm_lang$core$Native_Utils.update(
			m1,
			{groups: newGroups});
	});
var _user$project$DataModel$makeNewNode = F3(
	function (name, pname, model) {
		var m1 = _user$project$DataModel$getNodeIdentifier(model);
		var pId = A2(_user$project$DataModel$getNodeIdFromName, pname, m1.nodes);
		var newNode = A3(_user$project$Node$node, m1.curNodeId, name, pId);
		return {ctor: '_Tuple2', _0: newNode, _1: m1};
	});
var _user$project$DataModel$addNewNodeToModel = F3(
	function (name, parent, model) {
		var _p76 = A3(_user$project$DataModel$makeNewNode, name, parent, model);
		var newNode = _p76._0;
		var m1 = _p76._1;
		var newNodes = A2(
			F2(
				function (x, y) {
					return {ctor: '::', _0: x, _1: y};
				}),
			newNode,
			m1.nodes);
		return _elm_lang$core$Native_Utils.update(
			m1,
			{nodes: newNodes});
	});
var _user$project$DataModel$createGeometry = F2(
	function (s, model) {
		var m1 = _user$project$DataModel$getNodeIdentifier(model);
		var new_geometries = {
			ctor: '::',
			_0: A2(_user$project$Geometries$property, m1.curNodeId, s),
			_1: m1.geometries
		};
		return _elm_lang$core$Native_Utils.update(
			m1,
			{geometries: new_geometries});
	});
var _user$project$DataModel$updateRoles = F2(
	function (parameters, node) {
		var parameterIds = A2(
			_elm_lang$core$List$map,
			function (_) {
				return _.id;
			},
			parameters);
		var currentNetworks = A2(
			_elm_lang$core$List$map,
			function (_) {
				return _.network;
			},
			node.roles);
		var roleIdsToAdd = A2(
			_elm_lang$core$List$filter,
			function (parameterId) {
				return !A2(_elm_lang$core$List$member, parameterId, currentNetworks);
			},
			parameterIds);
		var rolesToAdd = A2(
			_elm_lang$core$List$map,
			function (parameterId) {
				return {network: parameterId, role: _user$project$ElementAttributes$RoleUnknown};
			},
			roleIdsToAdd);
		var roleIdsToRemove = A2(
			_elm_lang$core$List$filter,
			function (network) {
				return !A2(_elm_lang$core$List$member, network, parameterIds);
			},
			currentNetworks);
		var rolesWithoutRemoved = A2(
			_elm_lang$core$List$filter,
			function (role) {
				return !A2(_elm_lang$core$List$member, role.network, roleIdsToRemove);
			},
			node.roles);
		var roles = A2(_elm_lang$core$Basics_ops['++'], rolesWithoutRemoved, rolesToAdd);
		return _elm_lang$core$Native_Utils.update(
			node,
			{roles: roles});
	});
var _user$project$DataModel$maximumParameterId = function (list) {
	var _p77 = _elm_lang$core$List$maximum(
		A2(
			_elm_lang$core$List$map,
			function (x) {
				return x.id;
			},
			list));
	if (_p77.ctor === 'Nothing') {
		return 0;
	} else {
		return _p77._0;
	}
};
var _user$project$DataModel$maximumEdgeId = function (le) {
	var _p78 = _elm_lang$core$List$maximum(
		A2(
			_elm_lang$core$List$map,
			function (x) {
				return x.id;
			},
			le));
	if (_p78.ctor === 'Nothing') {
		return 0;
	} else {
		return _p78._0;
	}
};
var _user$project$DataModel$maximumNodeId = function (ln) {
	var _p79 = _elm_lang$core$List$maximum(
		A2(
			_elm_lang$core$List$map,
			function (x) {
				return x.id;
			},
			ln));
	if (_p79.ctor === 'Nothing') {
		return 0;
	} else {
		return _p79._0;
	}
};
var _user$project$DataModel$dataEdgeToEdge = function (de) {
	return de.data;
};
var _user$project$DataModel$dataNodeToNode = function (dn) {
	return dn.data;
};
var _user$project$DataModel$dataModelToModel = F2(
	function (dm, model) {
		var newId = _user$project$DataModel$getCurIdFromDataModel(dm);
		var le = A2(_elm_lang$core$List$map, _user$project$DataModel$dataEdgeToEdge, dm.edges);
		var ln = A2(
			_elm_lang$core$List$map,
			_user$project$DataModel$updateRoles(dm.parameters),
			A2(_elm_lang$core$List$map, _user$project$DataModel$dataNodeToNode, dm.nodes));
		return {nodes: ln, edges: le, parameters: dm.parameters, curNodeId: newId, groups: dm.groups, geometries: dm.geometries, lightedGroup: dm.lightedGroup, lightedGeometry: dm.lightedGeometry, selectedParameters: dm.selectedParameters, mustLayout: false, layouts: dm.layouts, geometryLayouts: dm.geometryLayouts, lightLayout: dm.lightLayout, rootBubbleLayout: dm.rootBubbleLayout, mask: dm.mask, geometryImage: _elm_lang$core$Maybe$Nothing};
	});
var _user$project$DataModel$defaultModel = {
	nodes: {ctor: '[]'},
	edges: {ctor: '[]'},
	parameters: _user$project$LinkParameters$defaultModel,
	curNodeId: 0,
	groups: _user$project$Groups$defaultModel,
	geometries: _user$project$Geometries$defaultModel,
	lightedGroup: _elm_lang$core$Maybe$Nothing,
	lightedGeometry: _elm_lang$core$Maybe$Nothing,
	selectedParameters: _elm_lang$core$Set$empty,
	mustLayout: false,
	layouts: {ctor: '[]'},
	geometryLayouts: {ctor: '[]'},
	lightLayout: _elm_lang$core$Maybe$Nothing,
	rootBubbleLayout: _elm_lang$core$Maybe$Nothing,
	mask: _user$project$Mask$defaultModel,
	geometryImage: _elm_lang$core$Maybe$Nothing
};
var _user$project$DataModel$Model = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return function (l) {
												return function (m) {
													return function (n) {
														return function (o) {
															return function (p) {
																return {nodes: a, edges: b, parameters: c, curNodeId: d, groups: e, geometries: f, lightedGroup: g, lightedGeometry: h, selectedParameters: i, mustLayout: j, layouts: k, geometryLayouts: l, lightLayout: m, rootBubbleLayout: n, mask: o, geometryImage: p};
															};
														};
													};
												};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _user$project$DataModel$MetaModel = F2(
	function (a, b) {
		return {filename: a, model: b};
	});
var _user$project$DataModel$ExportLink = F2(
	function (a, b) {
		return {filename: a, model: b};
	});
var _user$project$DataModel$DataNode = function (a) {
	return {data: a};
};
var _user$project$DataModel$DataEdge = function (a) {
	return {data: a};
};
var _user$project$DataModel$DataModel = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return function (l) {
												return function (m) {
													return function (n) {
														return {nodes: a, edges: b, parameters: c, groups: d, geometries: e, lightedGroup: f, lightedGeometry: g, selectedParameters: h, layouts: i, geometryLayouts: j, lightLayout: k, rootBubbleLayout: l, mask: m, geometryImage: n};
													};
												};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};

var _user$project$DataModelEncoders$encodeExport_ = function (meta) {
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'filename',
				_1: _elm_lang$core$Json_Encode$string(meta.filename)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'model',
					_1: _elm_lang$core$Json_Encode$string(meta.model)
				},
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$DataModelEncoders$encodeExport = function (_p0) {
	return A2(
		_elm_lang$core$Json_Encode$encode,
		0,
		_user$project$DataModelEncoders$encodeExport_(_p0));
};
var _user$project$DataModelEncoders$encodeElementState = function (state) {
	var _p1 = state;
	switch (_p1.ctor) {
		case 'RAS':
			return _elm_lang$core$Json_Encode$string('RAS');
		case 'HS':
			return _elm_lang$core$Json_Encode$string('HS');
		default:
			return _elm_lang$core$Json_Encode$string('unknown');
	}
};
var _user$project$DataModelEncoders$encodeRole = function (role) {
	var _p2 = role;
	switch (_p2.ctor) {
		case 'Producer':
			return _elm_lang$core$Json_Encode$string('producer');
		case 'Consumer':
			return _elm_lang$core$Json_Encode$string('consumer');
		case 'ProducerConsumer':
			return _elm_lang$core$Json_Encode$string('producer_consumer');
		default:
			return _elm_lang$core$Json_Encode$string('unknown');
	}
};
var _user$project$DataModelEncoders$encodePosition_ = function (position) {
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'x',
				_1: _elm_lang$core$Json_Encode$float(position.x)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'y',
					_1: _elm_lang$core$Json_Encode$float(position.y)
				},
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$DataModelEncoders$maybe = F2(
	function (encoder, maybeVal) {
		var _p3 = maybeVal;
		if (_p3.ctor === 'Nothing') {
			return _elm_lang$core$Json_Encode$null;
		} else {
			return encoder(_p3._0);
		}
	});
var _user$project$DataModelEncoders$encodeAttribut = function (attribut) {
	return _elm_lang$core$Json_Encode$string(attribut);
};
var _user$project$DataModelEncoders$encodeIdentifier = function (identifier) {
	return _elm_lang$core$Json_Encode$int(identifier);
};
var _user$project$DataModelEncoders$encodeNetworkRole = function (networkRole) {
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'network',
				_1: _user$project$DataModelEncoders$encodeIdentifier(networkRole.network)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'role',
					_1: _user$project$DataModelEncoders$encodeRole(networkRole.role)
				},
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$DataModelEncoders$encodeRoles = function (roles) {
	return _elm_lang$core$Json_Encode$list(
		A2(_elm_lang$core$List$map, _user$project$DataModelEncoders$encodeNetworkRole, roles));
};
var _user$project$DataModelEncoders$encodeNode_ = function (n) {
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'id',
				_1: _user$project$DataModelEncoders$encodeIdentifier(n.id)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'name',
					_1: _elm_lang$core$Json_Encode$string(n.name)
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'parent',
						_1: A2(_user$project$DataModelEncoders$maybe, _user$project$DataModelEncoders$encodeIdentifier, n.parent)
					},
					_1: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: 'attribut',
							_1: A2(_user$project$DataModelEncoders$maybe, _user$project$DataModelEncoders$encodeAttribut, n.attribut)
						},
						_1: {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: 'state',
								_1: _user$project$DataModelEncoders$encodeElementState(n.state)
							},
							_1: {
								ctor: '::',
								_0: {
									ctor: '_Tuple2',
									_0: 'roles',
									_1: _user$project$DataModelEncoders$encodeRoles(n.roles)
								},
								_1: {
									ctor: '::',
									_0: {
										ctor: '_Tuple2',
										_0: 'geometry',
										_1: A2(_user$project$DataModelEncoders$maybe, _user$project$DataModelEncoders$encodeIdentifier, n.geometry)
									},
									_1: {
										ctor: '::',
										_0: {
											ctor: '_Tuple2',
											_0: 'group',
											_1: _elm_lang$core$Json_Encode$list(
												A2(
													_elm_lang$core$List$map,
													_user$project$DataModelEncoders$encodeIdentifier,
													_elm_lang$core$Set$toList(n.group)))
										},
										_1: {
											ctor: '::',
											_0: {
												ctor: '_Tuple2',
												_0: 'highLighted',
												_1: _elm_lang$core$Json_Encode$int(n.highLighted)
											},
											_1: {
												ctor: '::',
												_0: {
													ctor: '_Tuple2',
													_0: 'position',
													_1: _user$project$DataModelEncoders$encodePosition_(n.position)
												},
												_1: {
													ctor: '::',
													_0: {
														ctor: '_Tuple2',
														_0: 'blow',
														_1: _elm_lang$core$Json_Encode$int(
															function () {
																var _p4 = n.blow;
																if (_p4 === true) {
																	return 1;
																} else {
																	return 0;
																}
															}())
													},
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		});
};
var _user$project$DataModelEncoders$encodeNode = function (_p5) {
	return A2(
		_elm_lang$core$Json_Encode$encode,
		0,
		_user$project$DataModelEncoders$encodeNode_(_p5));
};
var _user$project$DataModelEncoders$encodeNodeData = function (n) {
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'data',
				_1: _user$project$DataModelEncoders$encodeNode_(n)
			},
			_1: {ctor: '[]'}
		});
};
var _user$project$DataModelEncoders$encodeNodes = function (l) {
	return _elm_lang$core$Json_Encode$list(
		A2(_elm_lang$core$List$map, _user$project$DataModelEncoders$encodeNodeData, l));
};
var _user$project$DataModelEncoders$encodeEdge_ = function (je) {
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'id',
				_1: _user$project$DataModelEncoders$encodeIdentifier(je.id)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'source',
					_1: _user$project$DataModelEncoders$encodeIdentifier(je.source)
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'target',
						_1: _user$project$DataModelEncoders$encodeIdentifier(je.target)
					},
					_1: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: 'parameters',
							_1: _elm_lang$core$Json_Encode$list(
								A2(
									_elm_lang$core$List$map,
									_user$project$DataModelEncoders$encodeIdentifier,
									_elm_lang$core$Set$toList(je.parameters)))
						},
						_1: {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: 'state',
								_1: _user$project$DataModelEncoders$encodeElementState(je.state)
							},
							_1: {
								ctor: '::',
								_0: {
									ctor: '_Tuple2',
									_0: 'attribut',
									_1: A2(_user$project$DataModelEncoders$maybe, _user$project$DataModelEncoders$encodeAttribut, je.attribut)
								},
								_1: {
									ctor: '::',
									_0: {
										ctor: '_Tuple2',
										_0: 'highLighted',
										_1: _elm_lang$core$Json_Encode$int(je.highLighted)
									},
									_1: {
										ctor: '::',
										_0: {
											ctor: '_Tuple2',
											_0: 'tightness',
											_1: _elm_lang$core$Json_Encode$list(
												A2(
													_elm_lang$core$List$map,
													_user$project$DataModelEncoders$encodeIdentifier,
													_elm_lang$core$Set$toList(je.tightness)))
										},
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}
			}
		});
};
var _user$project$DataModelEncoders$encodeEdge = function (_p6) {
	return A2(
		_elm_lang$core$Json_Encode$encode,
		0,
		_user$project$DataModelEncoders$encodeEdge_(_p6));
};
var _user$project$DataModelEncoders$encodeEdgeData = function (je) {
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'data',
				_1: _user$project$DataModelEncoders$encodeEdge_(je)
			},
			_1: {ctor: '[]'}
		});
};
var _user$project$DataModelEncoders$encodeEdges = function (l) {
	return _elm_lang$core$Json_Encode$list(
		A2(_elm_lang$core$List$map, _user$project$DataModelEncoders$encodeEdgeData, l));
};
var _user$project$DataModelEncoders$encodeProperty = function (property) {
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'id',
				_1: _user$project$DataModelEncoders$encodeIdentifier(property.id)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'name',
					_1: _elm_lang$core$Json_Encode$string(property.name)
				},
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$DataModelEncoders$encodeParameters = function (parameters) {
	return _elm_lang$core$Json_Encode$list(
		A2(_elm_lang$core$List$map, _user$project$DataModelEncoders$encodeProperty, parameters));
};
var _user$project$DataModelEncoders$encodeGroupProperty = function (property) {
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'id',
				_1: _user$project$DataModelEncoders$encodeIdentifier(property.id)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'name',
					_1: _elm_lang$core$Json_Encode$string(property.name)
				},
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$DataModelEncoders$encodeGroups = function (groups) {
	return _elm_lang$core$Json_Encode$list(
		A2(_elm_lang$core$List$map, _user$project$DataModelEncoders$encodeGroupProperty, groups));
};
var _user$project$DataModelEncoders$encodeGeometryProperty = function (property) {
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'id',
				_1: _user$project$DataModelEncoders$encodeIdentifier(property.id)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'name',
					_1: _elm_lang$core$Json_Encode$string(property.name)
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'svg',
						_1: A2(_user$project$DataModelEncoders$maybe, _elm_lang$core$Json_Encode$string, property.svg)
					},
					_1: {ctor: '[]'}
				}
			}
		});
};
var _user$project$DataModelEncoders$encodeGeometries = function (geometries) {
	return _elm_lang$core$Json_Encode$list(
		A2(_elm_lang$core$List$map, _user$project$DataModelEncoders$encodeGeometryProperty, geometries));
};
var _user$project$DataModelEncoders$encodeNodePosition = function (np) {
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'id',
				_1: _user$project$DataModelEncoders$encodeIdentifier(np.id)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'position',
					_1: _user$project$DataModelEncoders$encodePosition_(np.position)
				},
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$DataModelEncoders$encodeNodePositionList = function (list) {
	return _elm_lang$core$Json_Encode$list(
		A2(_elm_lang$core$List$map, _user$project$DataModelEncoders$encodeNodePosition, list));
};
var _user$project$DataModelEncoders$encodeNodeLayout = function (nl) {
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'id',
				_1: _user$project$DataModelEncoders$encodeIdentifier(nl.id)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'layout',
					_1: _elm_lang$core$Json_Encode$list(
						A2(_elm_lang$core$List$map, _user$project$DataModelEncoders$encodeNodePosition, nl.layout))
				},
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$DataModelEncoders$encodeLayouts = function (list) {
	return _elm_lang$core$Json_Encode$list(
		A2(_elm_lang$core$List$map, _user$project$DataModelEncoders$encodeNodeLayout, list));
};
var _user$project$DataModelEncoders$encodeGeometryLayout = function (nl) {
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'id',
				_1: _user$project$DataModelEncoders$encodeIdentifier(nl.id)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'layout',
					_1: _elm_lang$core$Json_Encode$list(
						A2(_elm_lang$core$List$map, _user$project$DataModelEncoders$encodeNodePosition, nl.layout))
				},
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$DataModelEncoders$encodeGeometryLayouts = function (list) {
	return _elm_lang$core$Json_Encode$list(
		A2(_elm_lang$core$List$map, _user$project$DataModelEncoders$encodeGeometryLayout, list));
};
var _user$project$DataModelEncoders$encodeSelectedNetworks = function (parameters) {
	return _elm_lang$core$Json_Encode$list(
		A2(
			_elm_lang$core$List$map,
			_user$project$DataModelEncoders$encodeIdentifier,
			_elm_lang$core$Set$toList(parameters)));
};
var _user$project$DataModelEncoders$encodeModel = function (jsmodel) {
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'nodes',
				_1: _user$project$DataModelEncoders$encodeNodes(jsmodel.nodes)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'edges',
					_1: _user$project$DataModelEncoders$encodeEdges(jsmodel.edges)
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'parameters',
						_1: _user$project$DataModelEncoders$encodeParameters(jsmodel.parameters)
					},
					_1: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: 'groups',
							_1: _user$project$DataModelEncoders$encodeGroups(jsmodel.groups)
						},
						_1: {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: 'geometries',
								_1: _user$project$DataModelEncoders$encodeGeometries(jsmodel.geometries)
							},
							_1: {
								ctor: '::',
								_0: {
									ctor: '_Tuple2',
									_0: 'selectedNetworks',
									_1: _user$project$DataModelEncoders$encodeSelectedNetworks(jsmodel.selectedParameters)
								},
								_1: {
									ctor: '::',
									_0: {
										ctor: '_Tuple2',
										_0: 'mustLayout',
										_1: _elm_lang$core$Json_Encode$bool(jsmodel.mustLayout)
									},
									_1: {
										ctor: '::',
										_0: {
											ctor: '_Tuple2',
											_0: 'layouts',
											_1: _user$project$DataModelEncoders$encodeLayouts(jsmodel.layouts)
										},
										_1: {
											ctor: '::',
											_0: {
												ctor: '_Tuple2',
												_0: 'geometryLayouts',
												_1: _user$project$DataModelEncoders$encodeGeometryLayouts(jsmodel.geometryLayouts)
											},
											_1: {
												ctor: '::',
												_0: {
													ctor: '_Tuple2',
													_0: 'lightLayout',
													_1: A2(_user$project$DataModelEncoders$maybe, _user$project$DataModelEncoders$encodeNodePositionList, jsmodel.lightLayout)
												},
												_1: {
													ctor: '::',
													_0: {
														ctor: '_Tuple2',
														_0: 'rootBubbleLayout',
														_1: A2(_user$project$DataModelEncoders$maybe, _user$project$DataModelEncoders$encodeNodePositionList, jsmodel.rootBubbleLayout)
													},
													_1: {
														ctor: '::',
														_0: {
															ctor: '_Tuple2',
															_0: 'geometryImage',
															_1: A2(_user$project$DataModelEncoders$maybe, _elm_lang$core$Json_Encode$string, jsmodel.geometryImage)
														},
														_1: {ctor: '[]'}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		});
};
var _user$project$DataModelEncoders$encodeMetaModel_ = function (meta) {
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'filename',
				_1: _elm_lang$core$Json_Encode$string(meta.filename)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'model',
					_1: _user$project$DataModelEncoders$encodeModel(meta.model)
				},
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$DataModelEncoders$encodeMetaModel = function (_p7) {
	return A2(
		_elm_lang$core$Json_Encode$encode,
		0,
		_user$project$DataModelEncoders$encodeMetaModel_(_p7));
};
var _user$project$DataModelEncoders$encodeMaybeIdentifier = function (_p8) {
	return A2(
		_elm_lang$core$Json_Encode$encode,
		0,
		A2(_user$project$DataModelEncoders$maybe, _user$project$DataModelEncoders$encodeIdentifier, _p8));
};

var _user$project$ModelManagement$filterEdgesWithMask = F2(
	function (idToMask, edges) {
		return A2(
			_elm_lang$core$List$filter,
			function (x) {
				return (!A2(_elm_lang$core$List$member, x.source, idToMask)) && (!A2(_elm_lang$core$List$member, x.target, idToMask));
			},
			edges);
	});
var _user$project$ModelManagement$filterNodesWithMask = F2(
	function (nodesToMask, nodes) {
		return A2(
			_elm_lang$core$List$filter,
			function (x) {
				return !A2(_elm_lang$core$List$member, x, nodesToMask);
			},
			nodes);
	});
var _user$project$ModelManagement$maskToNodeList = F2(
	function (list, nodes) {
		var _p0 = list;
		if (_p0.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			var _p2 = _p0._1;
			var m_n = A2(_user$project$DataModel$getNodeFromId, _p0._0, nodes);
			var ln = function () {
				var _p1 = m_n;
				if (_p1.ctor === 'Nothing') {
					return A2(_user$project$ModelManagement$maskToNodeList, _p2, nodes);
				} else {
					return {
						ctor: '::',
						_0: _p1._0,
						_1: A2(_user$project$ModelManagement$maskToNodeList, _p2, nodes)
					};
				}
			}();
			return ln;
		}
	});
var _user$project$ModelManagement$findNodeInList_ = F2(
	function (n, list) {
		var filterList = A2(
			_elm_lang$core$List$filter,
			function (x) {
				return _elm_lang$core$Native_Utils.eq(x.id, n.id);
			},
			list);
		var res = function () {
			var _p3 = filterList;
			if (_p3.ctor === '[]') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				return _elm_lang$core$Maybe$Just(_p3._0);
			}
		}();
		return res;
	});
var _user$project$ModelManagement$findCommonElement_ = F2(
	function (l1, l2) {
		var _p4 = l1;
		if (_p4.ctor === '[]') {
			return _elm_lang$core$Maybe$Nothing;
		} else {
			var p = A2(_user$project$ModelManagement$findNodeInList_, _p4._0, l2);
			var res = function () {
				var _p5 = p;
				if (_p5.ctor === 'Nothing') {
					return A2(_user$project$ModelManagement$findCommonElement_, _p4._1, l2);
				} else {
					return p;
				}
			}();
			return res;
		}
	});
var _user$project$ModelManagement$getAscendants_ = F3(
	function (list, n, tmp) {
		var _p6 = n.parent;
		if (_p6.ctor === 'Nothing') {
			return {ctor: '::', _0: n, _1: tmp};
		} else {
			var maybeN = A2(_user$project$DataModel$getNodeFromId, _p6._0, list);
			var tmp1 = function () {
				var _p7 = maybeN;
				if (_p7.ctor === 'Nothing') {
					return {ctor: '::', _0: n, _1: tmp};
				} else {
					return A3(
						_user$project$ModelManagement$getAscendants_,
						list,
						_p7._0,
						{ctor: '::', _0: n, _1: tmp});
				}
			}();
			return tmp1;
		}
	});
var _user$project$ModelManagement$getAscendantsWithP_ = F4(
	function (list, n, p, tmp) {
		var _p8 = n.parent;
		if (_p8.ctor === 'Nothing') {
			return {ctor: '::', _0: n, _1: tmp};
		} else {
			var _p11 = _p8._0;
			var b = _elm_lang$core$Native_Utils.eq(_p11, p.id);
			var tmp1 = function () {
				var _p9 = b;
				if (_p9 === true) {
					return {ctor: '::', _0: n, _1: tmp};
				} else {
					var maybeN = A2(_user$project$DataModel$getNodeFromId, _p11, list);
					var tmp2 = function () {
						var _p10 = maybeN;
						if (_p10.ctor === 'Nothing') {
							return {ctor: '::', _0: n, _1: tmp};
						} else {
							return A4(
								_user$project$ModelManagement$getAscendantsWithP_,
								list,
								_p10._0,
								p,
								{ctor: '::', _0: n, _1: tmp});
						}
					}();
					return tmp2;
				}
			}();
			return tmp1;
		}
	});
var _user$project$ModelManagement$getAscendants = F3(
	function (list, n, maybe_p) {
		var result = function () {
			var _p12 = maybe_p;
			if (_p12.ctor === 'Nothing') {
				return A3(
					_user$project$ModelManagement$getAscendants_,
					list,
					n,
					{ctor: '[]'});
			} else {
				return A4(
					_user$project$ModelManagement$getAscendantsWithP_,
					list,
					n,
					_p12._0,
					{ctor: '[]'});
			}
		}();
		return _elm_lang$core$List$reverse(result);
	});
var _user$project$ModelManagement$findCommonParent = F3(
	function (list, n, m) {
		var lp2 = A3(_user$project$ModelManagement$getAscendants, list, m, _elm_lang$core$Maybe$Nothing);
		var lp1 = A3(_user$project$ModelManagement$getAscendants, list, n, _elm_lang$core$Maybe$Nothing);
		var commonElement = A2(_user$project$ModelManagement$findCommonElement_, lp1, lp2);
		return commonElement;
	});
var _user$project$ModelManagement$findCommonParentFromString = F3(
	function (list, s1, s2) {
		var maybe_m = A2(_user$project$DataModel$getNodeFromName, s2, list);
		var maybe_n = A2(_user$project$DataModel$getNodeFromName, s1, list);
		var res = function () {
			var _p13 = {ctor: '_Tuple2', _0: maybe_n, _1: maybe_m};
			if ((_p13._0.ctor === 'Just') && (_p13._1.ctor === 'Just')) {
				return A3(_user$project$ModelManagement$findCommonParent, list, _p13._0._0, _p13._1._0);
			} else {
				return _elm_lang$core$Maybe$Nothing;
			}
		}();
		return res;
	});
var _user$project$ModelManagement$getChildren = F2(
	function (list, n) {
		return A2(
			_elm_lang$core$List$filter,
			function (x) {
				return _elm_lang$core$Native_Utils.eq(
					x.parent,
					_elm_lang$core$Maybe$Just(n.id));
			},
			list);
	});
var _user$project$ModelManagement$getDescendantsFromN = F2(
	function (list, n) {
		return {
			ctor: '::',
			_0: n,
			_1: A2(
				_user$project$ModelManagement$getDescendants,
				list,
				A2(_user$project$ModelManagement$getChildren, list, n))
		};
	});
var _user$project$ModelManagement$getDescendants = F2(
	function (list, l1) {
		var _p14 = l1;
		if (_p14.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			return A2(
				_elm_lang$core$List$append,
				A2(_user$project$ModelManagement$getDescendantsFromN, list, _p14._0),
				A2(_user$project$ModelManagement$getDescendants, list, _p14._1));
		}
	});
var _user$project$ModelManagement$orderingNodesToPBS_ = F2(
	function (list, model) {
		var _p15 = list;
		if (_p15.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			return A2(
				_elm_lang$core$List$append,
				A2(_user$project$ModelManagement$getDescendantsFromN, model.nodes, _p15._0),
				A2(_user$project$ModelManagement$orderingNodesToPBS_, _p15._1, model));
		}
	});
var _user$project$ModelManagement$orderingNodesToPBS = function (model) {
	var list = A2(
		_elm_lang$core$List$filter,
		function (x) {
			return _elm_lang$core$Native_Utils.eq(x.parent, _elm_lang$core$Maybe$Nothing);
		},
		model.nodes);
	return A2(_user$project$ModelManagement$orderingNodesToPBS_, list, model);
};
var _user$project$ModelManagement$filterWithMask = function (model) {
	var lmask = _elm_lang$core$Set$toList(model.mask);
	var ln = A2(_user$project$ModelManagement$maskToNodeList, lmask, model.nodes);
	var nodesToMask = _elm_lang$core$List$concat(
		A2(
			_elm_lang$core$List$map,
			function (x) {
				return A2(_user$project$ModelManagement$getDescendantsFromN, model.nodes, x);
			},
			ln));
	var idToMask = A2(
		_elm_lang$core$List$map,
		function (x) {
			return x.id;
		},
		nodesToMask);
	var newEdges = A2(_user$project$ModelManagement$filterEdgesWithMask, idToMask, model.edges);
	var newNodes = A2(_user$project$ModelManagement$filterNodesWithMask, nodesToMask, model.nodes);
	return _elm_lang$core$Native_Utils.update(
		model,
		{nodes: newNodes, edges: newEdges});
};
var _user$project$ModelManagement$addBlowToList = F2(
	function (list, model) {
		var _p16 = list;
		if (_p16.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			var _p19 = _p16._1;
			var _p18 = _p16._0;
			var _p17 = _p18.blow;
			if (_p17 === false) {
				return {
					ctor: '::',
					_0: _p18,
					_1: A2(_user$project$ModelManagement$addBlowToList, _p19, model)
				};
			} else {
				return {
					ctor: '::',
					_0: _p18,
					_1: A2(
						_user$project$ModelManagement$addBlowToList,
						A2(
							_elm_lang$core$List$append,
							A2(_user$project$ModelManagement$getChildren, model.nodes, _p18),
							_p19),
						model)
				};
			}
		}
	});
var _user$project$ModelManagement$addBlowToListRecursive = F2(
	function (list, model) {
		return A2(_user$project$ModelManagement$addBlowToList, list, model);
	});
var _user$project$ModelManagement$listNtoPBS = function (list) {
	return A2(
		_elm_lang$core$List$map,
		function (n) {
			return _elm_lang$core$Native_Utils.update(
				n,
				{parent: _elm_lang$core$Maybe$Nothing});
		},
		list);
};
var _user$project$ModelManagement$nodesToPbsLnk_ = F4(
	function (list, treatedList, model, tmp) {
		nodesToPbsLnk_:
		while (true) {
			var _p20 = treatedList;
			if (_p20.ctor === '::') {
				var _p25 = _p20._1;
				var _p24 = _p20._0;
				var _p21 = _p24.parent;
				if (_p21.ctor === 'Nothing') {
					var _v18 = list,
						_v19 = _p25,
						_v20 = model,
						_v21 = tmp;
					list = _v18;
					treatedList = _v19;
					model = _v20;
					tmp = _v21;
					continue nodesToPbsLnk_;
				} else {
					var _p23 = _p21._0;
					var _p22 = A2(_user$project$DataModel$isNodeIdPresent, _p23, list);
					if (_p22 === false) {
						var _v23 = list,
							_v24 = _p25,
							_v25 = model,
							_v26 = tmp;
						list = _v23;
						treatedList = _v24;
						model = _v25;
						tmp = _v26;
						continue nodesToPbsLnk_;
					} else {
						var newModel = _user$project$DataModel$getNodeIdentifier(model);
						var edge = A3(_user$project$Link$makeLink, newModel.curNodeId, _p23, _p24.id);
						var tp1 = {ctor: '::', _0: edge, _1: tmp};
						var _v27 = list,
							_v28 = _p25,
							_v29 = newModel,
							_v30 = tp1;
						list = _v27;
						treatedList = _v28;
						model = _v29;
						tmp = _v30;
						continue nodesToPbsLnk_;
					}
				}
			} else {
				return {ctor: '_Tuple2', _0: tmp, _1: model};
			}
		}
	});
var _user$project$ModelManagement$nodesToPbsLnk = F2(
	function (list, model) {
		var _p26 = A4(
			_user$project$ModelManagement$nodesToPbsLnk_,
			list,
			list,
			model,
			{ctor: '[]'});
		var e = _p26._0;
		var m = _p26._1;
		return {ctor: '_Tuple2', _0: e, _1: m};
	});
var _user$project$ModelManagement$listNodeToPBS_ = F2(
	function (list, model) {
		var newNodes = _user$project$ModelManagement$listNtoPBS(list);
		var newModel = _elm_lang$core$Native_Utils.update(
			model,
			{
				nodes: newNodes,
				edges: {ctor: '[]'},
				curNodeId: _user$project$DataModel$maximumNodeId(newNodes)
			});
		var _p27 = A2(_user$project$ModelManagement$nodesToPbsLnk, list, newModel);
		var newEdges = _p27._0;
		var m2 = _p27._1;
		return _elm_lang$core$Native_Utils.update(
			m2,
			{nodes: newNodes, edges: newEdges});
	});
var _user$project$ModelManagement$listNodeToPBS = function (list) {
	return A2(_user$project$ModelManagement$listNodeToPBS_, list, _user$project$DataModel$defaultModel);
};
var _user$project$ModelManagement$listNodeToPBSFromNode = F2(
	function (list, n) {
		var n1 = _elm_lang$core$Native_Utils.update(
			n,
			{parent: _elm_lang$core$Maybe$Nothing});
		var newList = A2(_user$project$ModelManagement$getDescendantsFromN, list, n1);
		var newModel = _user$project$ModelManagement$listNodeToPBS(newList);
		return newModel;
	});
var _user$project$ModelManagement$listNodeToPBSFromNodeId = F2(
	function (list, id) {
		var _p28 = A2(_user$project$DataModel$getNodeFromId, id, list);
		if (_p28.ctor === 'Nothing') {
			return _user$project$DataModel$defaultModel;
		} else {
			return A2(_user$project$ModelManagement$listNodeToPBSFromNode, list, _p28._0);
		}
	});
var _user$project$ModelManagement$listNodeToPBSFromNodeName = F2(
	function (list, s) {
		var _p29 = A2(_user$project$DataModel$getNodeFromName, s, list);
		if (_p29.ctor === 'Nothing') {
			return _user$project$DataModel$defaultModel;
		} else {
			return A2(_user$project$ModelManagement$listNodeToPBSFromNode, list, _p29._0);
		}
	});
var _user$project$ModelManagement$extractAndstopToP_ = F3(
	function (list, tmp, p) {
		extractAndstopToP_:
		while (true) {
			var _p30 = list;
			if (_p30.ctor === '::') {
				var _p31 = _elm_lang$core$Native_Utils.eq(_p30._0, p);
				if (_p31 === true) {
					return tmp;
				} else {
					var _v35 = _p30._1,
						_v36 = tmp,
						_v37 = p;
					list = _v35;
					tmp = _v36;
					p = _v37;
					continue extractAndstopToP_;
				}
			} else {
				return tmp;
			}
		}
	});
var _user$project$ModelManagement$extractAndstopToP = F2(
	function (list, p) {
		return A3(
			_user$project$ModelManagement$extractAndstopToP_,
			list,
			{ctor: '[]'},
			p);
	});
var _user$project$ModelManagement$parentFromNode = F2(
	function (list, n) {
		var _p32 = n.parent;
		if (_p32.ctor === 'Nothing') {
			return _elm_lang$core$Maybe$Nothing;
		} else {
			return A2(_user$project$DataModel$getNodeFromId, _p32._0, list);
		}
	});
var _user$project$ModelManagement$getAllParentsFromNode_ = F3(
	function (list, tmp, n) {
		getAllParentsFromNode_:
		while (true) {
			var _p33 = _user$project$DataModel$nodeHasParent(n);
			if (_p33 === false) {
				return tmp;
			} else {
				var _p34 = A2(_user$project$ModelManagement$parentFromNode, list, n);
				if (_p34.ctor === 'Nothing') {
					return tmp;
				} else {
					var _p35 = _p34._0;
					var _v41 = list,
						_v42 = {ctor: '::', _0: _p35, _1: tmp},
						_v43 = _p35;
					list = _v41;
					tmp = _v42;
					n = _v43;
					continue getAllParentsFromNode_;
				}
			}
		}
	});
var _user$project$ModelManagement$getAllParentsFromNode = F2(
	function (list, n) {
		return A3(
			_user$project$ModelManagement$getAllParentsFromNode_,
			list,
			{ctor: '[]'},
			n);
	});
var _user$project$ModelManagement$getParentsFromNStopToP = F3(
	function (list, n, p) {
		var l1 = A2(_user$project$ModelManagement$getAllParentsFromNode, list, n);
		var l2 = A2(_user$project$ModelManagement$extractAndstopToP, l1, p);
		return l2;
	});
var _user$project$ModelManagement$mainFilter_ = F5(
	function (x, n, model, childNodes, edges) {
		if (A2(_user$project$DataModel$isNodeIdPresent, x.source, childNodes) && A2(_user$project$DataModel$isNodeIdPresent, x.target, childNodes)) {
			return true;
		} else {
			if (_elm_lang$core$Native_Utils.eq(x.source, n.id)) {
				var maybe_node = A2(_user$project$DataModel$getNodeFromId, x.target, model.nodes);
				var result = function () {
					var _p36 = maybe_node;
					if (_p36.ctor === 'Nothing') {
						return false;
					} else {
						return !A3(_user$project$DataModel$anyLink, childNodes, _p36._0, edges);
					}
				}();
				return result;
			} else {
				if (_elm_lang$core$Native_Utils.eq(x.target, n.id)) {
					var maybe_node = A2(_user$project$DataModel$getNodeFromId, x.source, model.nodes);
					var result = function () {
						var _p37 = maybe_node;
						if (_p37.ctor === 'Nothing') {
							return false;
						} else {
							return !A3(_user$project$DataModel$anyLink, childNodes, _p37._0, edges);
						}
					}();
					return result;
				} else {
					return true;
				}
			}
		}
	});
var _user$project$ModelManagement$isCommonPt_ = F3(
	function (list, n, x) {
		var maybe_p = A3(_user$project$ModelManagement$findCommonParent, list, n, x);
		var res = function () {
			var _p38 = maybe_p;
			if (_p38.ctor === 'Nothing') {
				return _elm_lang$core$Native_Utils.eq(x.parent, _elm_lang$core$Maybe$Nothing);
			} else {
				return _elm_lang$core$Native_Utils.eq(
					x.parent,
					_elm_lang$core$Maybe$Just(_p38._0.id));
			}
		}();
		return res;
	});
var _user$project$ModelManagement$filtNodeWithList_ = F3(
	function (l1, l2, x) {
		return (A2(_user$project$DataModel$isNodeIdPresent, x.source, l1) && A2(_user$project$DataModel$isNodeIdPresent, x.target, l2)) || (A2(_user$project$DataModel$isNodeIdPresent, x.target, l1) && A2(_user$project$DataModel$isNodeIdPresent, x.source, l2));
	});
var _user$project$ModelManagement$subBubblesFromUniverse = function (model) {
	var newNodes0 = A2(
		_elm_lang$core$List$filter,
		function (x) {
			return _elm_lang$core$Native_Utils.eq(x.parent, _elm_lang$core$Maybe$Nothing);
		},
		model.nodes);
	var newNodes = A2(_user$project$ModelManagement$addBlowToListRecursive, newNodes0, model);
	var newEdges = A2(
		_elm_lang$core$List$filter,
		function (x) {
			return A2(_user$project$DataModel$isNodeIdPresent, x.source, newNodes) && A2(_user$project$DataModel$isNodeIdPresent, x.target, newNodes);
		},
		model.edges);
	return _elm_lang$core$Native_Utils.update(
		model,
		{nodes: newNodes, edges: newEdges});
};
var _user$project$ModelManagement$existLinkTo = F3(
	function (list, n, edges) {
		return A2(
			_elm_lang$core$List$any,
			function (x) {
				return A2(
					_user$project$DataModel$isEdgePresent,
					A2(_user$project$Link$link, x.id, n.id),
					edges);
			},
			list);
	});
var _user$project$ModelManagement$subBubblesModelFromNode = F2(
	function (model, n) {
		var others = A2(
			_elm_lang$core$List$filter,
			function (x) {
				return A3(
					_user$project$ModelManagement$existLinkTo,
					{
						ctor: '::',
						_0: n,
						_1: {ctor: '[]'}
					},
					x,
					model.edges);
			},
			model.nodes);
		var externNodes = A2(
			_elm_lang$core$List$filter,
			function (x) {
				return A3(_user$project$ModelManagement$isCommonPt_, model.nodes, n, x) || _elm_lang$core$Native_Utils.eq(x.parent, _elm_lang$core$Maybe$Nothing);
			},
			others);
		var childNodes = A2(_user$project$ModelManagement$getChildren, model.nodes, n);
		var newNodes0 = {
			ctor: '::',
			_0: n,
			_1: A2(_elm_lang$core$List$append, childNodes, externNodes)
		};
		var newNodes = A2(_user$project$ModelManagement$addBlowToListRecursive, newNodes0, model);
		var newEdges1 = A2(
			_elm_lang$core$List$filter,
			function (x) {
				return A2(_user$project$DataModel$isNodeIdPresent, x.source, newNodes) && (A2(_user$project$DataModel$isNodeIdPresent, x.target, newNodes) && (!(A2(_user$project$DataModel$isNodeIdPresent, x.source, externNodes) && A2(_user$project$DataModel$isNodeIdPresent, x.target, externNodes))));
			},
			model.edges);
		var newEdges2 = A2(
			_elm_lang$core$List$filter,
			function (x) {
				return A5(_user$project$ModelManagement$mainFilter_, x, n, model, childNodes, newEdges1);
			},
			newEdges1);
		var newEdges = newEdges2;
		return _elm_lang$core$Native_Utils.update(
			model,
			{nodes: newNodes, edges: newEdges, curNodeId: 0});
	});
var _user$project$ModelManagement$subBubblesModelFromId = F2(
	function (model, id) {
		var _p39 = A2(_user$project$DataModel$getNodeFromId, id, model.nodes);
		if (_p39.ctor === 'Nothing') {
			return _user$project$DataModel$defaultModel;
		} else {
			return A2(_user$project$ModelManagement$subBubblesModelFromNode, model, _p39._0);
		}
	});
var _user$project$ModelManagement$subBubblesModelFromName = F2(
	function (model, s) {
		var _p40 = A2(_user$project$DataModel$getNodeFromName, s, model.nodes);
		if (_p40.ctor === 'Nothing') {
			return _user$project$DataModel$defaultModel;
		} else {
			return A2(_user$project$ModelManagement$subBubblesModelFromNode, model, _p40._0);
		}
	});
var _user$project$ModelManagement$filterBubblesEdgeN = F3(
	function (list, n, nodes) {
		return A2(
			_elm_lang$core$List$filter,
			function (x) {
				return A2(_user$project$DataModel$isNodeIdPresent, x.source, nodes) && A2(_user$project$DataModel$isNodeIdPresent, x.target, nodes);
			},
			list);
	});
var _user$project$ModelManagement$subBubblesModelFromNode0 = F2(
	function (model, n) {
		var allParentsN = A2(_user$project$ModelManagement$getAllParentsFromNode, model.nodes, n);
		var externNodesWithoutN = A2(
			_elm_lang$core$List$filter,
			function (x) {
				return _elm_lang$core$Native_Utils.eq(x.parent, _elm_lang$core$Maybe$Nothing) && (!A2(_user$project$DataModel$isNodePresent, x, allParentsN));
			},
			model.nodes);
		var externNodes = A2(
			_elm_lang$core$List$filter,
			function (x) {
				return A3(
					_user$project$ModelManagement$existLinkTo,
					{
						ctor: '::',
						_0: n,
						_1: {ctor: '[]'}
					},
					x,
					model.edges);
			},
			externNodesWithoutN);
		var brosN = A2(_user$project$DataModel$bros, n, model.nodes);
		var brosNodes = A2(
			_elm_lang$core$List$filter,
			function (x) {
				return A3(
					_user$project$ModelManagement$existLinkTo,
					{
						ctor: '::',
						_0: n,
						_1: {ctor: '[]'}
					},
					x,
					model.edges);
			},
			brosN);
		var childNodes = A2(_user$project$ModelManagement$getChildren, model.nodes, n);
		var childEdges = A3(_user$project$ModelManagement$filterBubblesEdgeN, model.edges, n, childNodes);
		var externEdges = A2(
			_elm_lang$core$List$filter,
			A2(
				_user$project$ModelManagement$filtNodeWithList_,
				externNodesWithoutN,
				{ctor: '::', _0: n, _1: childNodes}),
			model.edges);
		var brosEdges = A2(
			_elm_lang$core$List$filter,
			A2(
				_user$project$ModelManagement$filtNodeWithList_,
				brosN,
				{ctor: '::', _0: n, _1: childNodes}),
			model.edges);
		var newEdges1 = A2(
			_elm_lang$core$List$append,
			brosEdges,
			A2(_elm_lang$core$List$append, childEdges, externEdges));
		var newNodes1 = {
			ctor: '::',
			_0: n,
			_1: A2(
				_elm_lang$core$List$append,
				brosNodes,
				A2(_elm_lang$core$List$append, childNodes, externNodes))
		};
		var newNodes = A2(_user$project$ModelManagement$addBlowToListRecursive, newNodes1, model);
		return _elm_lang$core$Native_Utils.update(
			model,
			{nodes: newNodes, edges: newEdges1, curNodeId: 0});
	});
var _user$project$ModelManagement$filterSameParentWithoutN = F2(
	function (list, n) {
		return A2(
			_elm_lang$core$List$filter,
			function (x) {
				return _elm_lang$core$Native_Utils.eq(x.parent, n.parent) && (!_elm_lang$core$Native_Utils.eq(x.id, n.id));
			},
			list);
	});
var _user$project$ModelManagement$filterSameParent = F2(
	function (list, n) {
		return A2(
			_elm_lang$core$List$filter,
			function (x) {
				return _elm_lang$core$Native_Utils.eq(x.parent, n.parent);
			},
			list);
	});

var _user$project$LinkParametersActions$processProperty_ = F4(
	function (x, idx, edge, func) {
		var _p0 = A2(_user$project$Link$isEqual, x, edge);
		if (_p0 === false) {
			return edge;
		} else {
			return A2(func, idx, edge);
		}
	});
var _user$project$LinkParametersActions$updatePropertyInEdgeList_ = F4(
	function (x, idx, list, func) {
		return A2(
			_elm_lang$core$List$map,
			function (y) {
				return A4(_user$project$LinkParametersActions$processProperty_, x, idx, y, func);
			},
			list);
	});
var _user$project$LinkParametersActions$activateParameterForEdge_ = F4(
	function (idx, mId, nId, model) {
		var edge = A2(_user$project$Link$link, mId, nId);
		var newEdges = A4(_user$project$LinkParametersActions$updatePropertyInEdgeList_, edge, idx, model.edges, _user$project$Link$activate);
		var m_e = A3(_user$project$DataModel$getEdgeFromNodesId, mId, nId, newEdges);
		return _elm_lang$core$Native_Utils.update(
			model,
			{edges: newEdges});
	});
var _user$project$LinkParametersActions$activateParameterForOneList_ = F4(
	function (idx, list, nId, model) {
		var _p1 = list;
		if (_p1.ctor === '[]') {
			return model;
		} else {
			var m1 = A4(
				_user$project$LinkParametersActions$activateParameterForOneList_,
				idx,
				_p1._1,
				nId,
				A4(_user$project$LinkParametersActions$activateParameterForEdge_, idx, _p1._0.id, nId, model));
			return m1;
		}
	});
var _user$project$LinkParametersActions$activateParameterForLists_ = F4(
	function (idx, ls, lt, model) {
		activateParameterForLists_:
		while (true) {
			var _p2 = ls;
			if (_p2.ctor === '[]') {
				return model;
			} else {
				var _v3 = idx,
					_v4 = _p2._1,
					_v5 = lt,
					_v6 = A4(_user$project$LinkParametersActions$activateParameterForOneList_, idx, lt, _p2._0.id, model);
				idx = _v3;
				ls = _v4;
				lt = _v5;
				model = _v6;
				continue activateParameterForLists_;
			}
		}
	});
var _user$project$LinkParametersActions$activateParameter_ = F4(
	function (idx, n, m, model) {
		var commonParent = A3(_user$project$ModelManagement$findCommonParent, model.nodes, n, m);
		var ln = A3(_user$project$ModelManagement$getAscendants, model.nodes, n, commonParent);
		var lm = A3(_user$project$ModelManagement$getAscendants, model.nodes, m, commonParent);
		var m2 = A4(_user$project$LinkParametersActions$activateParameterForLists_, idx, ln, lm, model);
		return m2;
	});
var _user$project$LinkParametersActions$activateParameter = F3(
	function (idx, edge, model) {
		var nt = A2(_user$project$DataModel$getNodeFromId, edge.target, model.nodes);
		var ns = A2(_user$project$DataModel$getNodeFromId, edge.source, model.nodes);
		var newModel = function () {
			var _p3 = {ctor: '_Tuple2', _0: ns, _1: nt};
			if ((_p3._0.ctor === 'Just') && (_p3._1.ctor === 'Just')) {
				return A4(_user$project$LinkParametersActions$activateParameter_, idx, _p3._0._0, _p3._1._0, model);
			} else {
				return model;
			}
		}();
		return newModel;
	});
var _user$project$LinkParametersActions$activateParametersForOneEdge_ = F3(
	function (list, edge, model) {
		activateParametersForOneEdge_:
		while (true) {
			var _p4 = list;
			if (_p4.ctor === '[]') {
				return model;
			} else {
				var _v9 = _p4._1,
					_v10 = edge,
					_v11 = A3(_user$project$LinkParametersActions$activateParameter, _p4._0, edge, model);
				list = _v9;
				edge = _v10;
				model = _v11;
				continue activateParametersForOneEdge_;
			}
		}
	});
var _user$project$LinkParametersActions$activateParameters = F2(
	function (edges, model) {
		activateParameters:
		while (true) {
			var _p5 = edges;
			if (_p5.ctor === '[]') {
				return model;
			} else {
				var _p6 = _p5._0;
				var _v13 = _p5._1,
					_v14 = A3(
					_user$project$LinkParametersActions$activateParametersForOneEdge_,
					_elm_lang$core$Set$toList(_p6.parameters),
					_p6,
					model);
				edges = _v13;
				model = _v14;
				continue activateParameters;
			}
		}
	});
var _user$project$LinkParametersActions$unActivateParameterDownForEdge_ = F4(
	function (idx, mId, nId, model) {
		var edge = A2(_user$project$Link$link, mId, nId);
		var newEdges = A4(_user$project$LinkParametersActions$updatePropertyInEdgeList_, edge, idx, model.edges, _user$project$Link$unActivate);
		var m_e = A3(_user$project$DataModel$getEdgeFromNodesId, mId, nId, newEdges);
		return _elm_lang$core$Native_Utils.update(
			model,
			{edges: newEdges});
	});
var _user$project$LinkParametersActions$unActivateParameterDownForOneList_ = F4(
	function (idx, list, nId, model) {
		var _p7 = list;
		if (_p7.ctor === '[]') {
			return model;
		} else {
			var m1 = A4(
				_user$project$LinkParametersActions$unActivateParameterDownForOneList_,
				idx,
				_p7._1,
				nId,
				A4(_user$project$LinkParametersActions$unActivateParameterDownForEdge_, idx, _p7._0.id, nId, model));
			return m1;
		}
	});
var _user$project$LinkParametersActions$unActivateParameterDownForLists_ = F4(
	function (idx, ls, lt, model) {
		unActivateParameterDownForLists_:
		while (true) {
			var _p8 = ls;
			if (_p8.ctor === '[]') {
				return model;
			} else {
				var _v17 = idx,
					_v18 = _p8._1,
					_v19 = lt,
					_v20 = A4(_user$project$LinkParametersActions$unActivateParameterDownForOneList_, idx, lt, _p8._0.id, model);
				idx = _v17;
				ls = _v18;
				lt = _v19;
				model = _v20;
				continue unActivateParameterDownForLists_;
			}
		}
	});
var _user$project$LinkParametersActions$unActivateParameterDown_ = F4(
	function (idx, n, m, model) {
		var m_descendants = A2(_user$project$ModelManagement$getDescendantsFromN, model.nodes, m);
		var n_descendants = A2(_user$project$ModelManagement$getDescendantsFromN, model.nodes, n);
		var m1 = A4(_user$project$LinkParametersActions$unActivateParameterDownForLists_, idx, n_descendants, m_descendants, model);
		return m1;
	});
var _user$project$LinkParametersActions$unActivateParameterUpEdge_ = F4(
	function (idx, mId, nId, model) {
		var edge = A2(_user$project$Link$link, mId, nId);
		var newEdges = A4(_user$project$LinkParametersActions$updatePropertyInEdgeList_, edge, idx, model.edges, _user$project$Link$unActivate);
		var m_e = A3(_user$project$DataModel$getEdgeFromNodesId, mId, nId, newEdges);
		return _elm_lang$core$Native_Utils.update(
			model,
			{edges: newEdges});
	});
var _user$project$LinkParametersActions$canUnactivate = F4(
	function (idx, mId, nId, model) {
		var maybe_m = A2(_user$project$DataModel$getNodeFromId, mId, model.nodes);
		var maybe_n = A2(_user$project$DataModel$getNodeFromId, nId, model.nodes);
		var newModel = function () {
			var _p9 = {ctor: '_Tuple2', _0: maybe_n, _1: maybe_m};
			if ((_p9._0.ctor === 'Just') && (_p9._1.ctor === 'Just')) {
				var _p11 = _p9._0._0;
				var _p10 = _p9._1._0;
				var childs_m = A2(_user$project$DataModel$childs, _p10, model.nodes);
				var childs_plus_m = {ctor: '::', _0: _p10, _1: childs_m};
				var childs_n = A2(_user$project$DataModel$childs, _p11, model.nodes);
				var childs_plus_n = {ctor: '::', _0: _p11, _1: childs_n};
				var b2 = A4(_user$project$DataModel$anyLinksParameter, idx, childs_plus_n, childs_m, model.edges);
				var b1 = A4(_user$project$DataModel$anyLinksParameter, idx, childs_plus_m, childs_n, model.edges);
				var b = !(b1 || b2);
				return b;
			} else {
				return true;
			}
		}();
		return newModel;
	});
var _user$project$LinkParametersActions$unActivateParameterUpForEdge_ = F4(
	function (idx, mId, nId, model) {
		var _p12 = A4(_user$project$LinkParametersActions$canUnactivate, idx, mId, nId, model);
		if (_p12 === false) {
			return model;
		} else {
			return A4(_user$project$LinkParametersActions$unActivateParameterUpEdge_, idx, mId, nId, model);
		}
	});
var _user$project$LinkParametersActions$unActivateParameterUpForOneList_ = F4(
	function (idx, list, nId, model) {
		var _p13 = list;
		if (_p13.ctor === '[]') {
			return model;
		} else {
			var m1 = A4(
				_user$project$LinkParametersActions$unActivateParameterUpForOneList_,
				idx,
				_p13._1,
				nId,
				A4(_user$project$LinkParametersActions$unActivateParameterUpForEdge_, idx, _p13._0.id, nId, model));
			return m1;
		}
	});
var _user$project$LinkParametersActions$unActivateParameterUpForLists_ = F4(
	function (idx, ls, lt, model) {
		unActivateParameterUpForLists_:
		while (true) {
			var _p14 = ls;
			if (_p14.ctor === '[]') {
				return model;
			} else {
				var _v25 = idx,
					_v26 = _p14._1,
					_v27 = lt,
					_v28 = A4(_user$project$LinkParametersActions$unActivateParameterUpForOneList_, idx, lt, _p14._0.id, model);
				idx = _v25;
				ls = _v26;
				lt = _v27;
				model = _v28;
				continue unActivateParameterUpForLists_;
			}
		}
	});
var _user$project$LinkParametersActions$unActivateParameterUp_ = F4(
	function (idx, n, m, model) {
		var commonParent = A3(_user$project$ModelManagement$findCommonParent, model.nodes, n, m);
		var asc_n = A3(_user$project$ModelManagement$getAscendants, model.nodes, n, commonParent);
		var asc_m = A3(_user$project$ModelManagement$getAscendants, model.nodes, m, commonParent);
		return A4(_user$project$LinkParametersActions$unActivateParameterUpForLists_, idx, asc_n, asc_m, model);
	});
var _user$project$LinkParametersActions$unActivateParameter_ = F4(
	function (idx, n, m, model) {
		var m1 = A4(_user$project$LinkParametersActions$unActivateParameterDown_, idx, n, m, model);
		var m2 = A4(_user$project$LinkParametersActions$unActivateParameterUp_, idx, n, m, m1);
		return m2;
	});
var _user$project$LinkParametersActions$unActivateParameter = F3(
	function (idx, edge, model) {
		var nt = A2(_user$project$DataModel$getNodeFromId, edge.target, model.nodes);
		var ns = A2(_user$project$DataModel$getNodeFromId, edge.source, model.nodes);
		var newModel = function () {
			var _p15 = {ctor: '_Tuple2', _0: ns, _1: nt};
			if ((_p15._0.ctor === 'Just') && (_p15._1.ctor === 'Just')) {
				return A4(_user$project$LinkParametersActions$unActivateParameter_, idx, _p15._0._0, _p15._1._0, model);
			} else {
				return model;
			}
		}();
		return newModel;
	});
var _user$project$LinkParametersActions$unActivateAllParameters_ = F3(
	function (list, edge, model) {
		unActivateAllParameters_:
		while (true) {
			var _p16 = list;
			if (_p16.ctor === '[]') {
				return model;
			} else {
				var _v31 = _p16._1,
					_v32 = edge,
					_v33 = A3(_user$project$LinkParametersActions$unActivateParameter, _p16._0, edge, model);
				list = _v31;
				edge = _v32;
				model = _v33;
				continue unActivateAllParameters_;
			}
		}
	});
var _user$project$LinkParametersActions$unActivateAllParameters = F2(
	function (edge, model) {
		return A3(
			_user$project$LinkParametersActions$unActivateAllParameters_,
			_elm_lang$core$Set$toList(edge.parameters),
			edge,
			model);
	});

var _user$project$GroupsActions$canDeleteGroupFromNode = F3(
	function (id, n, model) {
		var childs_ = A2(_user$project$DataModel$childs, n, model.nodes);
		var l = A2(
			_elm_lang$core$List$filter,
			function (x) {
				return A2(_elm_lang$core$Set$member, id, x.group);
			},
			childs_);
		return _elm_lang$core$Native_Utils.eq(
			_elm_lang$core$List$length(l),
			0);
	});
var _user$project$GroupsActions$deleteGroupFromOneNode_ = F3(
	function (id, n, model) {
		var _p0 = A3(_user$project$GroupsActions$canDeleteGroupFromNode, id, n, model);
		if (_p0 === false) {
			return model;
		} else {
			var newNodes = A2(
				_elm_lang$core$List$map,
				function (x) {
					var _p1 = _elm_lang$core$Native_Utils.eq(x.id, n.id);
					if (_p1 === true) {
						return _elm_lang$core$Native_Utils.update(
							x,
							{
								group: A2(_elm_lang$core$Set$remove, id, x.group)
							});
					} else {
						return x;
					}
				},
				model.nodes);
			var m_n = A2(_user$project$DataModel$getNodeFromId, n.id, newNodes);
			return _elm_lang$core$Native_Utils.update(
				model,
				{nodes: newNodes});
		}
	});
var _user$project$GroupsActions$deleteGroupFromListNode_ = F3(
	function (id, list, model) {
		deleteGroupFromListNode_:
		while (true) {
			var _p2 = list;
			if (_p2.ctor === '[]') {
				return model;
			} else {
				var _v3 = id,
					_v4 = _p2._1,
					_v5 = A3(_user$project$GroupsActions$deleteGroupFromOneNode_, id, _p2._0, model);
				id = _v3;
				list = _v4;
				model = _v5;
				continue deleteGroupFromListNode_;
			}
		}
	});
var _user$project$GroupsActions$deleteGroupFromNode = F3(
	function (id, n, model) {
		var asc_n = A3(_user$project$ModelManagement$getAscendants, model.nodes, n, _elm_lang$core$Maybe$Nothing);
		return A3(_user$project$GroupsActions$deleteGroupFromListNode_, id, asc_n, model);
	});
var _user$project$GroupsActions$addGroupToOneNode_ = F3(
	function (id, n, model) {
		var newNodes = A2(
			_elm_lang$core$List$map,
			function (x) {
				var _p3 = _elm_lang$core$Native_Utils.eq(x.id, n.id);
				if (_p3 === true) {
					return _elm_lang$core$Native_Utils.update(
						x,
						{
							group: A2(_elm_lang$core$Set$insert, id, x.group)
						});
				} else {
					return x;
				}
			},
			model.nodes);
		var m_n = A2(_user$project$DataModel$getNodeFromId, n.id, newNodes);
		return _elm_lang$core$Native_Utils.update(
			model,
			{nodes: newNodes});
	});
var _user$project$GroupsActions$addGroupToListNode_ = F3(
	function (id, list, model) {
		addGroupToListNode_:
		while (true) {
			var _p4 = list;
			if (_p4.ctor === '[]') {
				return model;
			} else {
				var _v8 = id,
					_v9 = _p4._1,
					_v10 = A3(_user$project$GroupsActions$addGroupToOneNode_, id, _p4._0, model);
				id = _v8;
				list = _v9;
				model = _v10;
				continue addGroupToListNode_;
			}
		}
	});
var _user$project$GroupsActions$addGroupToNode = F3(
	function (id, n, model) {
		var asc_n = A3(_user$project$ModelManagement$getAscendants, model.nodes, n, _elm_lang$core$Maybe$Nothing);
		return A3(_user$project$GroupsActions$addGroupToListNode_, id, asc_n, model);
	});
var _user$project$GroupsActions$addGroupsToOneNode_ = F3(
	function (list, n, model) {
		addGroupsToOneNode_:
		while (true) {
			var _p5 = list;
			if (_p5.ctor === '[]') {
				return model;
			} else {
				var _v12 = _p5._1,
					_v13 = n,
					_v14 = A3(_user$project$GroupsActions$addGroupToNode, _p5._0, n, model);
				list = _v12;
				n = _v13;
				model = _v14;
				continue addGroupsToOneNode_;
			}
		}
	});
var _user$project$GroupsActions$addGroupsToNodes = F2(
	function (list, model) {
		addGroupsToNodes:
		while (true) {
			var _p6 = list;
			if (_p6.ctor === '[]') {
				return model;
			} else {
				var _p7 = _p6._0;
				var _v16 = _p6._1,
					_v17 = A3(
					_user$project$GroupsActions$addGroupsToOneNode_,
					_elm_lang$core$Set$toList(_p7.group),
					_p7,
					model);
				list = _v16;
				model = _v17;
				continue addGroupsToNodes;
			}
		}
	});

var _user$project$TranslateTmpDataModel$makeSetIdentifierfromDataModel = function (model) {
	var s2 = _elm_lang$core$Set$fromList(
		A2(
			_elm_lang$core$List$map,
			function (x) {
				return x.id;
			},
			model.edges));
	var s1 = _elm_lang$core$Set$fromList(
		A2(
			_elm_lang$core$List$map,
			function (x) {
				return x.id;
			},
			model.nodes));
	return A2(_elm_lang$core$Set$union, s1, s2);
};
var _user$project$TranslateTmpDataModel$translateIdentifier = F3(
	function (t, set, id) {
		var _p0 = A2(_elm_lang$core$Set$member, id, set);
		if (_p0 === true) {
			return id + t;
		} else {
			return id;
		}
	});
var _user$project$TranslateTmpDataModel$translateNode = F3(
	function (t, set, n) {
		var newParent = function () {
			var _p1 = n.parent;
			if (_p1.ctor === 'Nothing') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				return _elm_lang$core$Maybe$Just(
					A3(_user$project$TranslateTmpDataModel$translateIdentifier, t, set, _p1._0));
			}
		}();
		var newId = A3(_user$project$TranslateTmpDataModel$translateIdentifier, t, set, n.id);
		return _elm_lang$core$Native_Utils.update(
			n,
			{id: newId, parent: newParent});
	});
var _user$project$TranslateTmpDataModel$translateNodes = F3(
	function (t, set, list) {
		var _p2 = list;
		if (_p2.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			return {
				ctor: '::',
				_0: A3(_user$project$TranslateTmpDataModel$translateNode, t, set, _p2._0),
				_1: A3(_user$project$TranslateTmpDataModel$translateNodes, t, set, _p2._1)
			};
		}
	});
var _user$project$TranslateTmpDataModel$translateLink = F3(
	function (t, set, e) {
		var newTarget = A3(_user$project$TranslateTmpDataModel$translateIdentifier, t, set, e.target);
		var newSource = A3(_user$project$TranslateTmpDataModel$translateIdentifier, t, set, e.source);
		var newId = A3(_user$project$TranslateTmpDataModel$translateIdentifier, t, set, e.id);
		return _elm_lang$core$Native_Utils.update(
			e,
			{id: newId, source: newSource, target: newTarget});
	});
var _user$project$TranslateTmpDataModel$translateLinks = F3(
	function (t, set, list) {
		var _p3 = list;
		if (_p3.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			return {
				ctor: '::',
				_0: A3(_user$project$TranslateTmpDataModel$translateLink, t, set, _p3._0),
				_1: A3(_user$project$TranslateTmpDataModel$translateLinks, t, set, _p3._1)
			};
		}
	});
var _user$project$TranslateTmpDataModel$translateDataModel_ = F3(
	function (t, set, model) {
		var newDataModel = _user$project$DataModel$defaultModel;
		return _elm_lang$core$Native_Utils.update(
			newDataModel,
			{
				nodes: A3(_user$project$TranslateTmpDataModel$translateNodes, t, set, model.nodes),
				edges: A3(_user$project$TranslateTmpDataModel$translateLinks, t, set, model.edges)
			});
	});
var _user$project$TranslateTmpDataModel$translateDataModel = F2(
	function (i, model) {
		var set = _user$project$TranslateTmpDataModel$makeSetIdentifierfromDataModel(model);
		return A3(_user$project$TranslateTmpDataModel$translateDataModel_, i, set, model);
	});

var _user$project$GeometryActions$deleteGeometryFromNode = F3(
	function (id, n, model) {
		var newNodes = A2(
			_elm_lang$core$List$map,
			function (x) {
				var _p0 = _elm_lang$core$Native_Utils.eq(x.id, n.id);
				if (_p0 === true) {
					return _elm_lang$core$Native_Utils.update(
						x,
						{geometry: _elm_lang$core$Maybe$Nothing});
				} else {
					return x;
				}
			},
			model.nodes);
		return _elm_lang$core$Native_Utils.update(
			model,
			{nodes: newNodes});
	});
var _user$project$GeometryActions$addGeometryToNode = F3(
	function (id, n, model) {
		var newNodes = A2(
			_elm_lang$core$List$map,
			function (x) {
				var _p1 = _elm_lang$core$Native_Utils.eq(x.id, n.id);
				if (_p1 === true) {
					return _elm_lang$core$Native_Utils.update(
						x,
						{
							geometry: _elm_lang$core$Maybe$Just(id)
						});
				} else {
					return x;
				}
			},
			model.nodes);
		return _elm_lang$core$Native_Utils.update(
			model,
			{nodes: newNodes});
	});

var _user$project$Propagation$updateOutpoweredNode = F3(
	function (outpoweredNodeList, consumersIdList, node) {
		updateOutpoweredNode:
		while (true) {
			var _p0 = outpoweredNodeList;
			if (_p0.ctor === '[]') {
				return node;
			} else {
				var _p1 = _p0._0;
				if (_elm_lang$core$Native_Utils.eq(_p1.id, node.id)) {
					return A2(_elm_lang$core$List$member, _p1.id, consumersIdList) ? _elm_lang$core$Native_Utils.update(
						_p1,
						{highLighted: 3}) : _elm_lang$core$Native_Utils.update(
						_p1,
						{highLighted: 2});
				} else {
					var _v1 = _p0._1,
						_v2 = consumersIdList,
						_v3 = node;
					outpoweredNodeList = _v1;
					consumersIdList = _v2;
					node = _v3;
					continue updateOutpoweredNode;
				}
			}
		}
	});
var _user$project$Propagation$nodeListFromIds = F2(
	function (model, idList) {
		var maybeNodeList = A2(
			_elm_lang$core$List$map,
			function (x) {
				return A2(_user$project$DataModel$getNodeFromId, x, model.nodes);
			},
			idList);
		return A2(
			_elm_lang$core$List$filterMap,
			function (x) {
				return x;
			},
			maybeNodeList);
	});
var _user$project$Propagation$nodeIdList = function (nodeList) {
	return A2(
		_elm_lang$core$List$map,
		function (x) {
			return x.id;
		},
		nodeList);
};
var _user$project$Propagation$edgesFromNodeList = F2(
	function (model, node) {
		return A2(
			_elm_lang$core$List$filter,
			function (edge) {
				return (_elm_lang$core$Native_Utils.eq(edge.source, node.id) || _elm_lang$core$Native_Utils.eq(edge.target, node.id)) && _elm_lang$core$Native_Utils.eq(edge.state, _user$project$ElementAttributes$RAS);
			},
			model.edges);
	});
var _user$project$Propagation$validNodes = F2(
	function (model, nodeId) {
		var node = A2(_user$project$DataModel$getNodeFromId, nodeId, model.nodes);
		var _p2 = node;
		if (_p2.ctor === 'Nothing') {
			return false;
		} else {
			return _elm_lang$core$Native_Utils.eq(_p2._0.state, _user$project$ElementAttributes$RAS);
		}
	});
var _user$project$Propagation$getConnectedNodes = F2(
	function (model, node) {
		var _p3 = node;
		if (_p3.ctor === 'Nothing') {
			return {ctor: '[]'};
		} else {
			var _p4 = _p3._0;
			var connectedEdgesList = A2(_user$project$Propagation$edgesFromNodeList, model, _p4);
			var sourceEdges = A2(
				_elm_lang$core$List$filter,
				function (x) {
					return _elm_lang$core$Native_Utils.eq(x.source, _p4.id);
				},
				connectedEdgesList);
			var targetEdges = A2(
				_elm_lang$core$List$filter,
				function (x) {
					return _elm_lang$core$Native_Utils.eq(x.target, _p4.id);
				},
				connectedEdgesList);
			var connectedNodes = A2(
				_elm_lang$core$Basics_ops['++'],
				A2(
					_elm_lang$core$List$map,
					function (x) {
						return x.target;
					},
					sourceEdges),
				A2(
					_elm_lang$core$List$map,
					function (x) {
						return x.source;
					},
					targetEdges));
			return A2(
				_elm_lang$core$List$filter,
				function (x) {
					return _elm_lang$core$Native_Utils.eq(
						A2(_user$project$Propagation$validNodes, model, x),
						true);
				},
				connectedNodes);
		}
	});
var _user$project$Propagation$removeDuplicate = function (idList) {
	var idSet = _elm_lang$core$Set$fromList(idList);
	return _elm_lang$core$Set$toList(idSet);
};
var _user$project$Propagation$removeListFromAnother = F2(
	function (initialList, toRemoveList) {
		var toRemoveSet = _elm_lang$core$Set$fromList(toRemoveList);
		var initialSet = _elm_lang$core$Set$fromList(initialList);
		return _elm_lang$core$Set$toList(
			A2(_elm_lang$core$Set$diff, initialSet, toRemoveSet));
	});
var _user$project$Propagation$extendedProducerList = F3(
	function (doneNodesList, toDoNodesList, model) {
		extendedProducerList:
		while (true) {
			var _p5 = toDoNodesList;
			if (_p5.ctor === '[]') {
				return doneNodesList;
			} else {
				var _p6 = _p5._0;
				var newDoneNodeList = A2(
					_elm_lang$core$List$append,
					doneNodesList,
					{
						ctor: '::',
						_0: _p6,
						_1: {ctor: '[]'}
					});
				var node = A2(_user$project$DataModel$getNodeFromId, _p6, model.nodes);
				var connectedNodes = A2(_user$project$Propagation$getConnectedNodes, model, node);
				var extendedToDoList = A2(_elm_lang$core$List$append, _p5._1, connectedNodes);
				var newToDoNodesList = A2(_user$project$Propagation$removeListFromAnother, extendedToDoList, newDoneNodeList);
				var _v7 = newDoneNodeList,
					_v8 = newToDoNodesList,
					_v9 = model;
				doneNodesList = _v7;
				toDoNodesList = _v8;
				model = _v9;
				continue extendedProducerList;
			}
		}
	});
var _user$project$Propagation$hasRole = F2(
	function (role, node) {
		return A2(
			_elm_lang$core$List$any,
			function (networkRole) {
				return _elm_lang$core$Native_Utils.eq(networkRole.role, role);
			},
			node.roles);
	});
var _user$project$Propagation$isProducer = function (node) {
	return A2(_user$project$Propagation$hasRole, _user$project$ElementAttributes$Producer, node);
};
var _user$project$Propagation$producerList = function (model) {
	return A2(
		_elm_lang$core$List$filter,
		function (node) {
			return _user$project$Propagation$isProducer(node) && _elm_lang$core$Native_Utils.eq(node.state, _user$project$ElementAttributes$RAS);
		},
		model.nodes);
};
var _user$project$Propagation$isConsumer = function (node) {
	return A2(_user$project$Propagation$hasRole, _user$project$ElementAttributes$Consumer, node);
};
var _user$project$Propagation$consumerList = function (model) {
	return A2(
		_elm_lang$core$List$filter,
		function (node) {
			return _user$project$Propagation$isConsumer(node) && _elm_lang$core$Native_Utils.eq(node.state, _user$project$ElementAttributes$RAS);
		},
		model.nodes);
};
var _user$project$Propagation$findOutpoweredNodes = function (model) {
	var modelNodeIdList = A2(
		_elm_lang$core$List$map,
		function (x) {
			return x.id;
		},
		model.nodes);
	var prodNodeList = _user$project$Propagation$producerList(model);
	var initialProducersIdList = A2(
		_elm_lang$core$List$map,
		function (x) {
			return x.id;
		},
		prodNodeList);
	var extendedProducerIdList = A3(
		_user$project$Propagation$extendedProducerList,
		{ctor: '[]'},
		initialProducersIdList,
		model);
	return A2(_user$project$Propagation$removeListFromAnother, modelNodeIdList, extendedProducerIdList);
};
var _user$project$Propagation$updateOutpoweredEdge = F2(
	function (edge, outNodeIdList) {
		return (A2(_elm_lang$core$List$member, edge.source, outNodeIdList) && A2(_elm_lang$core$List$member, edge.target, outNodeIdList)) ? _elm_lang$core$Native_Utils.update(
			edge,
			{highLighted: 4}) : edge;
	});
var _user$project$Propagation$findOutpoweredEdges = F2(
	function (edges, outNodeIdList) {
		return A2(
			_elm_lang$core$List$map,
			function (x) {
				return A2(_user$project$Propagation$updateOutpoweredEdge, x, outNodeIdList);
			},
			edges);
	});
var _user$project$Propagation$propagationWithoutNetwork = function (model) {
	var initialEdgeList = A2(
		_elm_lang$core$List$map,
		function (x) {
			return _elm_lang$core$Native_Utils.update(
				x,
				{highLighted: 0});
		},
		model.edges);
	var consumerNodeList = _user$project$Propagation$consumerList(model);
	var initialConsumersIdList = A2(
		_elm_lang$core$List$map,
		function (x) {
			return x.id;
		},
		consumerNodeList);
	var outpoweredNodesIds = _user$project$Propagation$findOutpoweredNodes(model);
	var initialNodeList = A2(
		_elm_lang$core$List$map,
		function (x) {
			return _elm_lang$core$Native_Utils.update(
				x,
				{highLighted: 0});
		},
		model.nodes);
	var hsNodes = A2(
		_elm_lang$core$List$filter,
		function (x) {
			return _elm_lang$core$Native_Utils.eq(x.state, _user$project$ElementAttributes$HS);
		},
		initialNodeList);
	var outpoweredNodes = A2(
		_elm_lang$core$Basics_ops['++'],
		A2(_user$project$Propagation$nodeListFromIds, model, outpoweredNodesIds),
		hsNodes);
	var outAndHSNodeIds = A2(
		_elm_lang$core$Basics_ops['++'],
		outpoweredNodesIds,
		A2(
			_elm_lang$core$List$map,
			function (x) {
				return x.id;
			},
			hsNodes));
	var newEdgeList = A2(_user$project$Propagation$findOutpoweredEdges, initialEdgeList, outAndHSNodeIds);
	var newNodeList = A2(
		_elm_lang$core$List$map,
		function (x) {
			return A3(_user$project$Propagation$updateOutpoweredNode, outpoweredNodes, initialConsumersIdList, x);
		},
		initialNodeList);
	return _elm_lang$core$Native_Utils.update(
		model,
		{nodes: newNodeList, edges: newEdgeList});
};
var _user$project$Propagation$setNodeHighLight = F2(
	function (stateSummary, node) {
		return A2(_elm_lang$core$Set$member, node.id, stateSummary.affected) ? _elm_lang$core$Native_Utils.update(
			node,
			{highLighted: 3}) : (A2(_elm_lang$core$Set$member, node.id, stateSummary.outpowered) ? _elm_lang$core$Native_Utils.update(
			node,
			{highLighted: 2}) : _elm_lang$core$Native_Utils.update(
			node,
			{highLighted: 0}));
	});
var _user$project$Propagation$setEdgeHighLight = F2(
	function (stateSummary, edge) {
		return A2(_elm_lang$core$Set$member, edge.id, stateSummary.affected) ? _elm_lang$core$Native_Utils.update(
			edge,
			{highLighted: 4}) : _elm_lang$core$Native_Utils.update(
			edge,
			{highLighted: 0});
	});
var _user$project$Propagation$isConnectedToOneOf = F2(
	function (nodeIds, edge) {
		return A2(_elm_lang$core$Set$member, edge.target, nodeIds) || A2(_elm_lang$core$Set$member, edge.source, nodeIds);
	});
var _user$project$Propagation$removeEdgesConnectedTo = F2(
	function (koNodeIds, edges) {
		return A2(
			_elm_lang$core$List$filter,
			function (edge) {
				return !A2(_user$project$Propagation$isConnectedToOneOf, koNodeIds, edge);
			},
			edges);
	});
var _user$project$Propagation$findAffectedEdgesFromAffectedNodes = F2(
	function (edges, affectedNodeIds) {
		var isAffected = F2(
			function (nodeIds, edge) {
				return A2(_elm_lang$core$Set$member, edge.source, nodeIds) && A2(_elm_lang$core$Set$member, edge.target, nodeIds);
			});
		return _elm_lang$core$Set$fromList(
			A2(
				_elm_lang$core$List$map,
				function (_) {
					return _.id;
				},
				A2(
					_elm_lang$core$List$filter,
					isAffected(affectedNodeIds),
					edges)));
	});
var _user$project$Propagation$extractNotKO = function (elements) {
	return A2(
		_elm_lang$core$List$filter,
		function (element) {
			return !_elm_lang$core$Native_Utils.eq(element.state, _user$project$ElementAttributes$HS);
		},
		elements);
};
var _user$project$Propagation$extractKoIds = function (elements) {
	return _elm_lang$core$Set$fromList(
		A2(
			_elm_lang$core$List$map,
			function (_) {
				return _.id;
			},
			A2(
				_elm_lang$core$List$filter,
				function (element) {
					return _elm_lang$core$Native_Utils.eq(element.state, _user$project$ElementAttributes$HS);
				},
				elements)));
};
var _user$project$Propagation$getKoElementIds = F2(
	function (nodes, edges) {
		return A2(
			_elm_lang$core$Set$union,
			_user$project$Propagation$extractKoIds(nodes),
			_user$project$Propagation$extractKoIds(edges));
	});
var _user$project$Propagation$keepAffectedNodes = function (affectionReports) {
	return A2(
		_elm_lang$core$List$filter,
		function (result) {
			return result.isAffected;
		},
		affectionReports);
};
var _user$project$Propagation$convertAffectionReportToSummary = function (report) {
	return {
		affected: _elm_lang$core$Set$fromList(
			{
				ctor: '::',
				_0: report.nodeId,
				_1: {ctor: '[]'}
			}),
		onPath: report.connectedNodeIds
	};
};
var _user$project$Propagation$mergeAffectionSummary = F2(
	function (reportA, reportB) {
		var affected = A2(_elm_lang$core$Set$union, reportA.affected, reportB.affected);
		var onPath = A2(
			_elm_lang$core$Set$diff,
			A2(_elm_lang$core$Set$union, reportA.onPath, reportB.onPath),
			affected);
		return {affected: affected, onPath: onPath};
	});
var _user$project$Propagation$affectionSummary = function (affectionReports) {
	return A3(
		_elm_lang$core$List$foldl,
		_user$project$Propagation$mergeAffectionSummary,
		{affected: _elm_lang$core$Set$empty, onPath: _elm_lang$core$Set$empty},
		A2(_elm_lang$core$List$map, _user$project$Propagation$convertAffectionReportToSummary, affectionReports));
};
var _user$project$Propagation$getConnectedProducerIds = F2(
	function (producerIds, connectedIds) {
		return A2(_elm_lang$core$Set$intersect, producerIds, connectedIds);
	});
var _user$project$Propagation$isEdgeOnlyConnectedToOneOf = F2(
	function (nodeIds, edge) {
		return A2(_elm_lang$core$Set$member, edge.source, nodeIds) && A2(_elm_lang$core$Set$member, edge.target, nodeIds);
	});
var _user$project$Propagation$isParentOf = F2(
	function (node, maybeParent) {
		var _p7 = maybeParent.parent;
		if (_p7.ctor === 'Nothing') {
			return false;
		} else {
			return _elm_lang$core$Native_Utils.eq(_p7._0, node.id);
		}
	});
var _user$project$Propagation$isParent = F2(
	function (nodes, node) {
		return A2(
			_elm_lang$core$List$any,
			_user$project$Propagation$isParentOf(node),
			nodes);
	});
var _user$project$Propagation$isLowestLevelNode = F2(
	function (nodes, node) {
		return !A2(_user$project$Propagation$isParent, nodes, node);
	});
var _user$project$Propagation$getLowestLevelGraph = function (graph) {
	var lowestLevelNodes = A2(
		_elm_lang$core$List$filter,
		_user$project$Propagation$isLowestLevelNode(graph.nodes),
		graph.nodes);
	var lowestLevelEdges = A2(
		_elm_lang$core$List$filter,
		_user$project$Propagation$isEdgeOnlyConnectedToOneOf(
			_elm_lang$core$Set$fromList(
				A2(
					_elm_lang$core$List$map,
					function (_) {
						return _.id;
					},
					lowestLevelNodes))),
		graph.edges);
	return _elm_lang$core$Native_Utils.update(
		graph,
		{nodes: lowestLevelNodes, edges: lowestLevelEdges});
};
var _user$project$Propagation$getSubGraphForNetwork = F2(
	function (parameterId, graph) {
		var edges = A2(
			_elm_lang$core$List$filter,
			function (edge) {
				return A2(_elm_lang$core$Set$member, parameterId, edge.parameters);
			},
			graph.edges);
		return _elm_lang$core$Native_Utils.update(
			graph,
			{edges: edges});
	});
var _user$project$Propagation$getEdgesToNodeId = F2(
	function (edges, nodeId) {
		return A2(
			_elm_lang$core$List$filter,
			function (x) {
				return _elm_lang$core$Native_Utils.eq(x.target, nodeId);
			},
			edges);
	});
var _user$project$Propagation$getEdgesFromNodeId = F2(
	function (edges, nodeId) {
		return A2(
			_elm_lang$core$List$filter,
			function (x) {
				return _elm_lang$core$Native_Utils.eq(x.source, nodeId);
			},
			edges);
	});
var _user$project$Propagation$getConnectedNodeIds = F2(
	function (edges, nodeId) {
		var targetEdges = A2(_user$project$Propagation$getEdgesToNodeId, edges, nodeId);
		var sourceEdges = A2(_user$project$Propagation$getEdgesFromNodeId, edges, nodeId);
		var connectedNodeIds = A2(
			_elm_lang$core$Basics_ops['++'],
			A2(
				_elm_lang$core$List$map,
				function (x) {
					return x.target;
				},
				sourceEdges),
			A2(
				_elm_lang$core$List$map,
				function (x) {
					return x.source;
				},
				targetEdges));
		return connectedNodeIds;
	});
var _user$project$Propagation$getConnectedNodeIdsRecursively = F3(
	function (nextNodeIds, doneNodeIds, edges) {
		getConnectedNodeIdsRecursively:
		while (true) {
			var _p8 = nextNodeIds;
			if (_p8.ctor === '[]') {
				return doneNodeIds;
			} else {
				var _p9 = _p8._0;
				var newDoneNodeList = {ctor: '::', _0: _p9, _1: doneNodeIds};
				var connectedNodes = A2(_user$project$Propagation$getConnectedNodeIds, edges, _p9);
				var extendedToDoList = A2(_elm_lang$core$Basics_ops['++'], _p8._1, connectedNodes);
				var newToDoNodesList = A2(_user$project$Propagation$removeListFromAnother, extendedToDoList, newDoneNodeList);
				var _v12 = newToDoNodesList,
					_v13 = newDoneNodeList,
					_v14 = edges;
				nextNodeIds = _v12;
				doneNodeIds = _v13;
				edges = _v14;
				continue getConnectedNodeIdsRecursively;
			}
		}
	});
var _user$project$Propagation$getAllConnectedNodeIds = F2(
	function (edges, nodeId) {
		return _elm_lang$core$Set$fromList(
			A3(
				_user$project$Propagation$getConnectedNodeIdsRecursively,
				{
					ctor: '::',
					_0: nodeId,
					_1: {ctor: '[]'}
				},
				{ctor: '[]'},
				edges));
	});
var _user$project$Propagation$isNodeNotConnectedToAProducer = F3(
	function (edges, producerIds, nodeId) {
		var connectedNodeIds = A2(_user$project$Propagation$getAllConnectedNodeIds, edges, nodeId);
		var connectedProducerIds = A2(_user$project$Propagation$getConnectedProducerIds, producerIds, connectedNodeIds);
		return {
			isAffected: _elm_lang$core$Set$isEmpty(connectedProducerIds),
			nodeId: nodeId,
			connectedNodeIds: A2(_elm_lang$core$Set$remove, nodeId, connectedNodeIds)
		};
	});
var _user$project$Propagation$getAffectedNodeIdsForNetwork = F2(
	function (graph, parameterId) {
		var subgraph = A2(_user$project$Propagation$getSubGraphForNetwork, parameterId, graph);
		var producerRole = {network: parameterId, role: _user$project$ElementAttributes$Producer};
		var producerIds = _elm_lang$core$Set$fromList(
			A2(
				_elm_lang$core$List$map,
				function (_) {
					return _.id;
				},
				A2(
					_elm_lang$core$List$filter,
					function (node) {
						return A2(_elm_lang$core$List$member, producerRole, node.roles);
					},
					graph.nodes)));
		var consumerRole = {network: parameterId, role: _user$project$ElementAttributes$Consumer};
		var consumerIds = A2(
			_elm_lang$core$List$map,
			function (_) {
				return _.id;
			},
			A2(
				_elm_lang$core$List$filter,
				function (node) {
					return A2(_elm_lang$core$List$member, consumerRole, node.roles);
				},
				graph.nodes));
		return _user$project$Propagation$affectionSummary(
			_user$project$Propagation$keepAffectedNodes(
				A2(
					_elm_lang$core$List$map,
					A2(_user$project$Propagation$isNodeNotConnectedToAProducer, subgraph.edges, producerIds),
					consumerIds)));
	});
var _user$project$Propagation$getStateSummary = F3(
	function (nodes, edges, networkIds) {
		var koEdgeIds = _user$project$Propagation$extractKoIds(edges);
		var koNodeIds = _user$project$Propagation$extractKoIds(nodes);
		var remainingGraph = {
			nodes: _user$project$Propagation$extractNotKO(nodes),
			edges: A2(
				_user$project$Propagation$removeEdgesConnectedTo,
				koNodeIds,
				_user$project$Propagation$extractNotKO(edges))
		};
		var affectionSummary = A3(
			_elm_lang$core$List$foldl,
			_user$project$Propagation$mergeAffectionSummary,
			{affected: _elm_lang$core$Set$empty, onPath: _elm_lang$core$Set$empty},
			A2(
				_elm_lang$core$List$map,
				_user$project$Propagation$getAffectedNodeIdsForNetwork(remainingGraph),
				networkIds));
		var affectedNodeIds = affectionSummary.affected;
		var outpoweredNodeIds = affectionSummary.onPath;
		var affectedEdgeIds = A2(
			_user$project$Propagation$findAffectedEdgesFromAffectedNodes,
			edges,
			A2(
				_elm_lang$core$Set$union,
				koNodeIds,
				A2(_elm_lang$core$Set$union, affectedNodeIds, outpoweredNodeIds)));
		return {
			ko: A2(_elm_lang$core$Set$union, koNodeIds, koEdgeIds),
			affected: A2(_elm_lang$core$Set$union, affectedNodeIds, affectedEdgeIds),
			outpowered: outpoweredNodeIds
		};
	});
var _user$project$Propagation$propagationWithNetwork = F2(
	function (model, parameterIds) {
		var lowestLevelGraph = _user$project$Propagation$getLowestLevelGraph(
			{nodes: model.nodes, edges: model.edges});
		var stateSummary = A3(_user$project$Propagation$getStateSummary, lowestLevelGraph.nodes, lowestLevelGraph.edges, parameterIds);
		var edges = A2(
			_elm_lang$core$List$map,
			_user$project$Propagation$setEdgeHighLight(stateSummary),
			model.edges);
		var nodes = A2(
			_elm_lang$core$List$map,
			_user$project$Propagation$setNodeHighLight(stateSummary),
			model.nodes);
		return _elm_lang$core$Native_Utils.update(
			model,
			{nodes: nodes, edges: edges});
	});
var _user$project$Propagation$propagation = function (model) {
	return A2(
		_user$project$Propagation$propagationWithNetwork,
		model,
		_elm_lang$core$Set$toList(model.selectedParameters));
};
var _user$project$Propagation$Graph = F2(
	function (a, b) {
		return {nodes: a, edges: b};
	});
var _user$project$Propagation$AffectionReport = F3(
	function (a, b, c) {
		return {isAffected: a, nodeId: b, connectedNodeIds: c};
	});
var _user$project$Propagation$AffectionSummary = F2(
	function (a, b) {
		return {affected: a, onPath: b};
	});
var _user$project$Propagation$StateSummary = F3(
	function (a, b, c) {
		return {ko: a, affected: b, outpowered: c};
	});

var _user$project$DataModelActions$unblowAll = function (model) {
	return _elm_lang$core$Native_Utils.update(
		model,
		{
			nodes: A2(
				_elm_lang$core$List$map,
				function (x) {
					return _elm_lang$core$Native_Utils.update(
						x,
						{blow: false});
				},
				model.nodes)
		});
};
var _user$project$DataModelActions$blow = F2(
	function (id, model) {
		var _p0 = A2(_user$project$DataModel$getNodeFromId, id, model.nodes);
		if (_p0.ctor === 'Nothing') {
			return model;
		} else {
			var newNodes = A2(
				_elm_lang$core$List$map,
				function (x) {
					var _p1 = _elm_lang$core$Native_Utils.eq(x.id, _p0._0.id);
					if (_p1 === true) {
						return _user$project$Node$blow(x);
					} else {
						return x;
					}
				},
				model.nodes);
			return _elm_lang$core$Native_Utils.update(
				model,
				{nodes: newNodes});
		}
	});
var _user$project$DataModelActions$sendGeometryName = F2(
	function (element, model) {
		var newGeometries = A2(
			_elm_lang$core$List$map,
			function (x) {
				var _p2 = _elm_lang$core$Native_Utils.eq(x.id, element.id);
				if (_p2 === true) {
					return _elm_lang$core$Native_Utils.update(
						x,
						{svg: element.svg});
				} else {
					return x;
				}
			},
			model.geometries);
		return _elm_lang$core$Native_Utils.update(
			model,
			{geometries: newGeometries});
	});
var _user$project$DataModelActions$filterEdge_ = F3(
	function (edge, id, list) {
		var m_n = A2(_user$project$DataModel$getNodeFromId, id, list);
		var b = function () {
			var _p3 = m_n;
			if (_p3.ctor === 'Nothing') {
				return true;
			} else {
				var l1 = A3(_user$project$ModelManagement$getAscendants, list, _p3._0, _elm_lang$core$Maybe$Nothing);
				var b1 = (A2(_user$project$DataModel$isNodeIdPresent, edge.source, l1) && _elm_lang$core$Native_Utils.eq(edge.target, id)) || (A2(_user$project$DataModel$isNodeIdPresent, edge.target, l1) && _elm_lang$core$Native_Utils.eq(edge.source, id));
				return !b1;
			}
		}();
		return b;
	});
var _user$project$DataModelActions$removeMask = F2(
	function (id, model) {
		var m1 = function () {
			var _p4 = A2(_user$project$DataModel$getNodeFromId, id, model.nodes);
			if (_p4.ctor === 'Just') {
				var newMask = A2(_user$project$Mask$remove, _p4._0.id, model.mask);
				return _elm_lang$core$Native_Utils.update(
					model,
					{mask: newMask});
			} else {
				return model;
			}
		}();
		return m1;
	});
var _user$project$DataModelActions$insertMask = F2(
	function (id, model) {
		var m1 = function () {
			var _p5 = A2(_user$project$DataModel$getNodeFromId, id, model.nodes);
			if (_p5.ctor === 'Just') {
				var newMask = A2(_user$project$Mask$insert, _p5._0.id, model.mask);
				return _elm_lang$core$Native_Utils.update(
					model,
					{mask: newMask});
			} else {
				return model;
			}
		}();
		return m1;
	});
var _user$project$DataModelActions$isMasked = F2(
	function (id, model) {
		return A2(_user$project$Mask$member, id, model.mask);
	});
var _user$project$DataModelActions$ascNameFromList_ = F2(
	function (list, slash) {
		var _p6 = list;
		if (_p6.ctor === '[]') {
			return '';
		} else {
			var _p9 = _p6._1;
			var _p8 = _p6._0;
			var _p7 = _elm_lang$core$List$length(_p9);
			if (_p7 === 0) {
				return _p8.name;
			} else {
				return A2(
					_elm_lang$core$Basics_ops['++'],
					_p8.name,
					A2(
						_elm_lang$core$Basics_ops['++'],
						slash,
						A2(_user$project$DataModelActions$ascNameFromList_, _p9, slash)));
			}
		}
	});
var _user$project$DataModelActions$getAscendantName = F2(
	function (n, model) {
		var list = A3(_user$project$ModelManagement$getAscendants, model.nodes, n, _elm_lang$core$Maybe$Nothing);
		return A2(
			_user$project$DataModelActions$ascNameFromList_,
			_elm_lang$core$List$reverse(list),
			'/');
	});
var _user$project$DataModelActions$updateOutpowered = function (model) {
	return _user$project$Propagation$propagation(model);
};
var _user$project$DataModelActions$updateLightLayout = F2(
	function (elements, model) {
		return _elm_lang$core$Native_Utils.update(
			model,
			{
				lightLayout: _elm_lang$core$Maybe$Just(elements)
			});
	});
var _user$project$DataModelActions$addGeometryLayout_ = F3(
	function (i, lay, model) {
		var newGeometryLayouts = {
			ctor: '::',
			_0: {id: i, layout: lay},
			_1: model.geometryLayouts
		};
		return _elm_lang$core$Native_Utils.update(
			model,
			{geometryLayouts: newGeometryLayouts});
	});
var _user$project$DataModelActions$updateGeometryLayoutFromId = F3(
	function (m_id, lay, model) {
		var _p10 = m_id;
		if (_p10.ctor === 'Nothing') {
			return model;
		} else {
			var _p13 = _p10._0;
			var m_l = A2(_user$project$DataModel$getGeometryLayoutFromId, _p13, model);
			var newModel = function () {
				var _p11 = m_l;
				if (_p11.ctor === 'Nothing') {
					return A3(_user$project$DataModelActions$addGeometryLayout_, _p13, lay, model);
				} else {
					var newLayouts = A2(
						_elm_lang$core$List$map,
						function (x) {
							var _p12 = _elm_lang$core$Native_Utils.eq(x.id, _p13);
							if (_p12 === true) {
								return _elm_lang$core$Native_Utils.update(
									x,
									{layout: lay});
							} else {
								return x;
							}
						},
						model.geometryLayouts);
					return _elm_lang$core$Native_Utils.update(
						model,
						{geometryLayouts: newLayouts});
				}
			}();
			var b = A2(_user$project$DataModel$isLayoutPresent, _p13, model.geometryLayouts);
			return newModel;
		}
	});
var _user$project$DataModelActions$isNodePositionMember_ = F2(
	function (lay, np) {
		isNodePositionMember_:
		while (true) {
			var _p14 = lay;
			if (_p14.ctor === '[]') {
				return false;
			} else {
				var _p15 = _elm_lang$core$Native_Utils.eq(_p14._0.id, np.id);
				if (_p15 === true) {
					return true;
				} else {
					var _v13 = _p14._1,
						_v14 = np;
					lay = _v13;
					np = _v14;
					continue isNodePositionMember_;
				}
			}
		}
	});
var _user$project$DataModelActions$completeLayoutWithNodePosition_ = F2(
	function (lay, np) {
		var _p16 = A2(_user$project$DataModelActions$isNodePositionMember_, lay, np);
		if (_p16 === true) {
			return A2(
				_elm_lang$core$List$map,
				function (x) {
					var _p17 = _elm_lang$core$Native_Utils.eq(x.id, np.id);
					if (_p17 === true) {
						return np;
					} else {
						return x;
					}
				},
				lay);
		} else {
			return {ctor: '::', _0: np, _1: lay};
		}
	});
var _user$project$DataModelActions$completeLayout_ = F2(
	function (ori, $new) {
		completeLayout_:
		while (true) {
			var _p18 = $new;
			if (_p18.ctor === '[]') {
				return ori;
			} else {
				var _v18 = A2(_user$project$DataModelActions$completeLayoutWithNodePosition_, ori, _p18._0),
					_v19 = _p18._1;
				ori = _v18;
				$new = _v19;
				continue completeLayout_;
			}
		}
	});
var _user$project$DataModelActions$completeMaybeLayout_ = F2(
	function (ori, $new) {
		var _p19 = ori;
		if (_p19.ctor === 'Nothing') {
			return _elm_lang$core$Maybe$Just($new);
		} else {
			return _elm_lang$core$Maybe$Just(
				A2(_user$project$DataModelActions$completeLayout_, _p19._0, $new));
		}
	});
var _user$project$DataModelActions$addLayout_ = F3(
	function (i, lay, model) {
		var newLayouts = {
			ctor: '::',
			_0: {id: i, layout: lay},
			_1: model.layouts
		};
		return _elm_lang$core$Native_Utils.update(
			model,
			{layouts: newLayouts});
	});
var _user$project$DataModelActions$updateLayoutFromNodeId = F3(
	function (m_id, lay, model) {
		var _p20 = m_id;
		if (_p20.ctor === 'Nothing') {
			return _elm_lang$core$Native_Utils.update(
				model,
				{
					rootBubbleLayout: A2(_user$project$DataModelActions$completeMaybeLayout_, model.rootBubbleLayout, lay)
				});
		} else {
			var _p23 = _p20._0;
			var m_l = A2(_user$project$DataModel$getLayoutFromNodeId, _p23, model);
			var newModel = function () {
				var _p21 = m_l;
				if (_p21.ctor === 'Nothing') {
					return A3(_user$project$DataModelActions$addLayout_, _p23, lay, model);
				} else {
					var newLayouts = A2(
						_elm_lang$core$List$map,
						function (x) {
							var _p22 = _elm_lang$core$Native_Utils.eq(x.id, _p23);
							if (_p22 === true) {
								return _elm_lang$core$Native_Utils.update(
									x,
									{
										layout: A2(_user$project$DataModelActions$completeLayout_, x.layout, lay)
									});
							} else {
								return x;
							}
						},
						model.layouts);
					return _elm_lang$core$Native_Utils.update(
						model,
						{layouts: newLayouts});
				}
			}();
			var b = A2(_user$project$DataModel$isLayoutPresent, _p23, model.layouts);
			return newModel;
		}
	});
var _user$project$DataModelActions$updateTightnessForGroup = F3(
	function (s, edgeId, model) {
		var m_group = A2(_user$project$Groups$getPropertyIdFromName, s, model.groups);
		var newModel = function () {
			var _p24 = m_group;
			if (_p24.ctor === 'Nothing') {
				return model;
			} else {
				var newEdges = A3(_user$project$TightnessActions$updateTightnessForEdgeId, _p24._0, edgeId, model.edges);
				return _elm_lang$core$Native_Utils.update(
					model,
					{edges: newEdges});
			}
		}();
		return newModel;
	});
var _user$project$DataModelActions$updateNodesPosition = F2(
	function (list, model) {
		updateNodesPosition:
		while (true) {
			var _p25 = list;
			if (_p25.ctor === '[]') {
				return model;
			} else {
				var _p27 = _p25._0;
				var newNodes = A2(
					_elm_lang$core$List$map,
					function (x) {
						var _p26 = _elm_lang$core$Native_Utils.eq(x.id, _p27.id);
						if (_p26 === true) {
							return _elm_lang$core$Native_Utils.update(
								x,
								{position: _p27.position});
						} else {
							return x;
						}
					},
					model.nodes);
				var m1 = _elm_lang$core$Native_Utils.update(
					model,
					{nodes: newNodes, mustLayout: false});
				var _v27 = _p25._1,
					_v28 = m1;
				list = _v27;
				model = _v28;
				continue updateNodesPosition;
			}
		}
	});
var _user$project$DataModelActions$selectedParameters = F2(
	function (s, model) {
		var m_id = A2(_user$project$LinkParameters$getPropertyIdFromName, s, model.parameters);
		var newModel = function () {
			var _p28 = m_id;
			if (_p28.ctor === 'Nothing') {
				return model;
			} else {
				var _p32 = _p28._0;
				var newSelectedParameters = function () {
					var _p29 = A2(_elm_lang$core$Set$member, _p32, model.selectedParameters);
					if (_p29 === true) {
						return A2(_elm_lang$core$Set$remove, _p32, model.selectedParameters);
					} else {
						return A2(_elm_lang$core$Set$insert, _p32, model.selectedParameters);
					}
				}();
				var newEdgesFilter = A2(
					_elm_lang$core$List$filter,
					function (x) {
						return A2(
							_elm_lang$core$List$any,
							function (y) {
								return A2(_elm_lang$core$Set$member, y, x.parameters);
							},
							_elm_lang$core$Set$toList(newSelectedParameters));
					},
					model.edges);
				var newNodes = A2(
					_elm_lang$core$List$map,
					function (x) {
						var _p30 = A2(
							_elm_lang$core$List$any,
							function (y) {
								return _elm_lang$core$Native_Utils.eq(y.source, x.id) || _elm_lang$core$Native_Utils.eq(y.target, x.id);
							},
							newEdgesFilter);
						if (_p30 === true) {
							return _elm_lang$core$Native_Utils.update(
								x,
								{highLighted: 1});
						} else {
							return _elm_lang$core$Native_Utils.update(
								x,
								{highLighted: 0});
						}
					},
					model.nodes);
				var newEdges = A2(
					_elm_lang$core$List$map,
					function (x) {
						var _p31 = A2(
							_elm_lang$core$List$any,
							function (y) {
								return A2(_elm_lang$core$Set$member, y, x.parameters);
							},
							_elm_lang$core$Set$toList(newSelectedParameters));
						if (_p31 === true) {
							return _elm_lang$core$Native_Utils.update(
								x,
								{highLighted: 1});
						} else {
							return _elm_lang$core$Native_Utils.update(
								x,
								{highLighted: 0});
						}
					},
					model.edges);
				return _elm_lang$core$Native_Utils.update(
					model,
					{selectedParameters: newSelectedParameters, edges: newEdges, nodes: newNodes});
			}
		}();
		return newModel;
	});
var _user$project$DataModelActions$highLightGroup = F2(
	function (s, model) {
		var m_id = A2(_user$project$Groups$getPropertyIdFromName, s, model.groups);
		var newModel = function () {
			var _p33 = m_id;
			if (_p33.ctor === 'Nothing') {
				return model;
			} else {
				var _p41 = _p33._0;
				var newLightedGroup = function () {
					var _p34 = _elm_lang$core$Native_Utils.eq(
						model.lightedGroup,
						_elm_lang$core$Maybe$Just(_p41));
					if (_p34 === true) {
						return _elm_lang$core$Maybe$Nothing;
					} else {
						return _elm_lang$core$Maybe$Just(_p41);
					}
				}();
				var filterNodes = A2(
					_elm_lang$core$List$filter,
					function (x) {
						var _p35 = newLightedGroup;
						if (_p35.ctor === 'Nothing') {
							return false;
						} else {
							return A2(_elm_lang$core$Set$member, _p35._0, x.group);
						}
					},
					model.nodes);
				var newEdges = A2(
					_elm_lang$core$List$map,
					function (x) {
						var _p36 = {
							ctor: '_Tuple2',
							_0: A2(_user$project$DataModel$isNodeIdPresent, x.source, filterNodes),
							_1: A2(_user$project$DataModel$isNodeIdPresent, x.target, filterNodes)
						};
						if (_p36._0 === true) {
							if (_p36._1 === true) {
								return _elm_lang$core$Native_Utils.update(
									x,
									{highLighted: 1});
							} else {
								var _p38 = A2(_user$project$Tightness$isTightness, _p41, x.tightness);
								if (_p38 === true) {
									return _elm_lang$core$Native_Utils.update(
										x,
										{highLighted: 2});
								} else {
									return _elm_lang$core$Native_Utils.update(
										x,
										{highLighted: 3});
								}
							}
						} else {
							if (_p36._1 === true) {
								var _p37 = A2(_user$project$Tightness$isTightness, _p41, x.tightness);
								if (_p37 === true) {
									return _elm_lang$core$Native_Utils.update(
										x,
										{highLighted: 2});
								} else {
									return _elm_lang$core$Native_Utils.update(
										x,
										{highLighted: 3});
								}
							} else {
								return _elm_lang$core$Native_Utils.update(
									x,
									{highLighted: 0});
							}
						}
					},
					model.edges);
				var newNodes = A2(
					_elm_lang$core$List$map,
					function (x) {
						var _p39 = newLightedGroup;
						if (_p39.ctor === 'Nothing') {
							return _elm_lang$core$Native_Utils.update(
								x,
								{highLighted: 0});
						} else {
							var _p40 = A2(_elm_lang$core$Set$member, _p39._0, x.group);
							if (_p40 === true) {
								return _elm_lang$core$Native_Utils.update(
									x,
									{highLighted: 1});
							} else {
								return _elm_lang$core$Native_Utils.update(
									x,
									{highLighted: 0});
							}
						}
					},
					model.nodes);
				return _elm_lang$core$Native_Utils.update(
					model,
					{nodes: newNodes, edges: newEdges, lightedGroup: newLightedGroup});
			}
		}();
		return newModel;
	});
var _user$project$DataModelActions$updateNodeGroupProperty = F3(
	function (n, s, model) {
		var m_id = A2(_user$project$Groups$getPropertyIdFromName, s, model.groups);
		var m1 = function () {
			var _p42 = m_id;
			if (_p42.ctor === 'Nothing') {
				return model;
			} else {
				var _p44 = _p42._0;
				var newModel = function () {
					var _p43 = A2(_user$project$Node$inGroup, _p44, n);
					if (_p43 === false) {
						return A3(_user$project$GroupsActions$addGroupToNode, _p44, n, model);
					} else {
						return A3(_user$project$GroupsActions$deleteGroupFromNode, _p44, n, model);
					}
				}();
				return newModel;
			}
		}();
		return m1;
	});
var _user$project$DataModelActions$isDescendantOneOfList_ = F3(
	function (id, list, model) {
		var _p45 = list;
		if (_p45.ctor === '[]') {
			return false;
		} else {
			var b = function () {
				var _p46 = A2(
					_user$project$DataModel$isNodeIdPresent,
					id,
					A2(_user$project$ModelManagement$getDescendantsFromN, model.nodes, _p45._0));
				if (_p46 === true) {
					return true;
				} else {
					return A3(_user$project$DataModelActions$isDescendantOneOfList_, id, _p45._1, model);
				}
			}();
			return b;
		}
	});
var _user$project$DataModelActions$updateParameters_ = F2(
	function (edge, model) {
		var newEdges = A2(
			_elm_lang$core$List$map,
			function (x) {
				var _p47 = A2(_user$project$Link$isEqual, x, edge);
				if (_p47 === true) {
					return A2(_user$project$Link$updateActivePoperties, edge.parameters, x);
				} else {
					return x;
				}
			},
			model.edges);
		return _elm_lang$core$Native_Utils.update(
			model,
			{edges: newEdges});
	});
var _user$project$DataModelActions$cloneEdge_ = F2(
	function (edge, model) {
		var dataModelNewId = function () {
			var _p48 = A2(_user$project$DataModel$isEdgePresent, edge, model.edges);
			if (_p48 === true) {
				return A2(_user$project$DataModelActions$updateParameters_, edge, model);
			} else {
				var dm1 = _user$project$DataModel$getNodeIdentifier(model);
				var newEdges = {
					ctor: '::',
					_0: _elm_lang$core$Native_Utils.update(
						edge,
						{id: dm1.curNodeId, attribut: _elm_lang$core$Maybe$Nothing}),
					_1: dm1.edges
				};
				var dm11 = _elm_lang$core$Native_Utils.update(
					dm1,
					{edges: newEdges});
				return dm11;
			}
		}();
		return dataModelNewId;
	});
var _user$project$DataModelActions$duplicateEdgesFromList = F2(
	function (list, model) {
		duplicateEdgesFromList:
		while (true) {
			var _p49 = list;
			if (_p49.ctor === '[]') {
				return model;
			} else {
				var m1 = A2(_user$project$DataModelActions$cloneEdge_, _p49._0, model);
				var _v48 = _p49._1,
					_v49 = m1;
				list = _v48;
				model = _v49;
				continue duplicateEdgesFromList;
			}
		}
	});
var _user$project$DataModelActions$desactivateParameterOnAllLinks = F2(
	function (idx, model) {
		var newEdges = A2(
			_elm_lang$core$List$map,
			function (x) {
				return A2(_user$project$Link$unActivate, idx, x);
			},
			model.edges);
		return _elm_lang$core$Native_Utils.update(
			model,
			{edges: newEdges});
	});
var _user$project$DataModelActions$deleteParameter = F2(
	function (s, model) {
		var maybe_parameter = A2(_user$project$LinkParameters$getPropertyIdFromName, s, model.parameters);
		var m1 = function () {
			var _p50 = maybe_parameter;
			if (_p50.ctor === 'Nothing') {
				return model;
			} else {
				var m2 = A2(_user$project$DataModelActions$desactivateParameterOnAllLinks, _p50._0, model);
				var newDataModel = A2(_user$project$DataModel$deleteProperty, s, m2);
				return newDataModel;
			}
		}();
		return m1;
	});
var _user$project$DataModelActions$createParameter = F2(
	function (s, model) {
		return A2(_user$project$DataModel$createProperty, s, model);
	});
var _user$project$DataModelActions$updateNodeGeometryProperty = F3(
	function (n, s, model) {
		var m_id = A2(_user$project$Geometries$getPropertyIdFromName, s, model.geometries);
		var m1 = function () {
			var _p51 = m_id;
			if (_p51.ctor === 'Nothing') {
				return model;
			} else {
				var _p53 = _p51._0;
				var newModel = function () {
					var _p52 = A2(_user$project$Node$hasGeometry, _p53, n);
					if (_p52 === false) {
						return A3(_user$project$GeometryActions$addGeometryToNode, _p53, n, model);
					} else {
						return A3(_user$project$GeometryActions$deleteGeometryFromNode, _p53, n, model);
					}
				}();
				return newModel;
			}
		}();
		return m1;
	});
var _user$project$DataModelActions$deleteGeometry = F2(
	function (s, model) {
		return A2(_user$project$DataModel$deleteGeometry, s, model);
	});
var _user$project$DataModelActions$createGeometry = F2(
	function (s, model) {
		return A2(_user$project$DataModel$createGeometry, s, model);
	});
var _user$project$DataModelActions$deleteGroup = F2(
	function (s, model) {
		return A2(_user$project$DataModel$deleteGroupProperty, s, model);
	});
var _user$project$DataModelActions$createGroup = F2(
	function (s, model) {
		return A2(_user$project$DataModel$createGroupProperty, s, model);
	});
var _user$project$DataModelActions$updateProperty = F3(
	function (edge, s, model) {
		var maybe_propId = A2(_user$project$LinkParameters$getPropertyIdFromName, s, model.parameters);
		var newModel = function () {
			var _p54 = maybe_propId;
			if (_p54.ctor === 'Nothing') {
				return model;
			} else {
				var _p56 = _p54._0;
				var m1 = function () {
					var _p55 = A2(_user$project$Link$isActive, _p56, edge);
					if (_p55 === false) {
						return A3(_user$project$LinkParametersActions$activateParameter, _p56, edge, model);
					} else {
						return A3(_user$project$LinkParametersActions$unActivateParameter, _p56, edge, model);
					}
				}();
				return m1;
			}
		}();
		return newModel;
	});
var _user$project$DataModelActions$replaceEdgeState = F3(
	function (id, elemState, edge) {
		return _elm_lang$core$Native_Utils.eq(edge.id, id) ? _elm_lang$core$Native_Utils.update(
			edge,
			{state: elemState}) : edge;
	});
var _user$project$DataModelActions$replaceNodeState = F3(
	function (nodeIdsToUpdate, elementState, node) {
		return A2(_elm_lang$core$Set$member, node.id, nodeIdsToUpdate) ? _elm_lang$core$Native_Utils.update(
			node,
			{state: elementState}) : node;
	});
var _user$project$DataModelActions$updateNodeAndDescendantsStates = F3(
	function (id, elemState, nodes) {
		var _p57 = A2(_user$project$DataModel$getNodeFromId, id, nodes);
		if (_p57.ctor === 'Nothing') {
			return nodes;
		} else {
			var _p58 = _p57._0;
			var descendants = A2(_user$project$ModelManagement$getDescendantsFromN, nodes, _p58);
			var nodeIdsToUpdate = _elm_lang$core$Set$fromList(
				{
					ctor: '::',
					_0: _p58.id,
					_1: A2(
						_elm_lang$core$List$map,
						function (_) {
							return _.id;
						},
						descendants)
				});
			return A2(
				_elm_lang$core$List$map,
				A2(_user$project$DataModelActions$replaceNodeState, nodeIdsToUpdate, elemState),
				nodes);
		}
	});
var _user$project$DataModelActions$updateState = F3(
	function (id, elemState, dataModel) {
		var newEdges = A2(
			_elm_lang$core$List$map,
			function (x) {
				return A3(_user$project$DataModelActions$replaceEdgeState, id, elemState, x);
			},
			dataModel.edges);
		var newNodes = A3(_user$project$DataModelActions$updateNodeAndDescendantsStates, id, elemState, dataModel.nodes);
		return _elm_lang$core$Native_Utils.update(
			dataModel,
			{nodes: newNodes, edges: newEdges});
	});
var _user$project$DataModelActions$updateRoles = F3(
	function (roles, network, newRole) {
		var updateRoleInNetwork = function (item) {
			return _elm_lang$core$Native_Utils.eq(item.network, network) ? _elm_lang$core$Native_Utils.update(
				item,
				{role: newRole}) : item;
		};
		return A2(_elm_lang$core$List$map, updateRoleInNetwork, roles);
	});
var _user$project$DataModelActions$replaceNodeRoles = F4(
	function (nodeIdsToUpdate, networkId, role, node) {
		return A2(_elm_lang$core$Set$member, node.id, nodeIdsToUpdate) ? _elm_lang$core$Native_Utils.update(
			node,
			{
				roles: A3(_user$project$DataModelActions$updateRoles, node.roles, networkId, role)
			}) : node;
	});
var _user$project$DataModelActions$updateNodeAndDescendantsRoles = F4(
	function (id, role, networkId, nodes) {
		var _p59 = A2(_user$project$DataModel$getNodeFromId, id, nodes);
		if (_p59.ctor === 'Nothing') {
			return nodes;
		} else {
			var _p60 = _p59._0;
			var descendants = A2(_user$project$ModelManagement$getDescendantsFromN, nodes, _p60);
			var nodeIdsToUpdate = _elm_lang$core$Set$fromList(
				{
					ctor: '::',
					_0: _p60.id,
					_1: A2(
						_elm_lang$core$List$map,
						function (_) {
							return _.id;
						},
						descendants)
				});
			return A2(
				_elm_lang$core$List$map,
				A3(_user$project$DataModelActions$replaceNodeRoles, nodeIdsToUpdate, networkId, role),
				nodes);
		}
	});
var _user$project$DataModelActions$updateNodeRoles = F4(
	function (id, networkId, role, dataModel) {
		var newNodes = A4(_user$project$DataModelActions$updateNodeAndDescendantsRoles, id, role, networkId, dataModel.nodes);
		return _elm_lang$core$Native_Utils.update(
			dataModel,
			{nodes: newNodes});
	});
var _user$project$DataModelActions$fedge_ = F3(
	function (id, s, e) {
		var newEdge = function () {
			var _p61 = _elm_lang$core$Native_Utils.eq(e.id, id);
			if (_p61 === true) {
				var _p62 = _elm_lang$core$String$length(s);
				if (_p62 === 0) {
					return _elm_lang$core$Native_Utils.update(
						e,
						{attribut: _elm_lang$core$Maybe$Nothing});
				} else {
					return _elm_lang$core$Native_Utils.update(
						e,
						{
							attribut: _elm_lang$core$Maybe$Just(s)
						});
				}
			} else {
				return e;
			}
		}();
		return newEdge;
	});
var _user$project$DataModelActions$fnode_ = F3(
	function (id, s, n) {
		var newNode = function () {
			var _p63 = _elm_lang$core$Native_Utils.eq(n.id, id);
			if (_p63 === true) {
				var _p64 = _elm_lang$core$String$length(s);
				if (_p64 === 0) {
					return _elm_lang$core$Native_Utils.update(
						n,
						{attribut: _elm_lang$core$Maybe$Nothing});
				} else {
					return _elm_lang$core$Native_Utils.update(
						n,
						{
							attribut: _elm_lang$core$Maybe$Just(s)
						});
				}
			} else {
				return n;
			}
		}();
		return newNode;
	});
var _user$project$DataModelActions$updateAttribute = F3(
	function (m_id, s, dataModel) {
		var _p65 = m_id;
		if (_p65.ctor === 'Nothing') {
			return dataModel;
		} else {
			var _p66 = _p65._0;
			var newEdges = A2(
				_elm_lang$core$List$map,
				function (x) {
					return A3(_user$project$DataModelActions$fedge_, _p66, s, x);
				},
				dataModel.edges);
			var newNodes = A2(
				_elm_lang$core$List$map,
				function (x) {
					return A3(_user$project$DataModelActions$fnode_, _p66, s, x);
				},
				dataModel.nodes);
			return _elm_lang$core$Native_Utils.update(
				dataModel,
				{nodes: newNodes, edges: newEdges});
		}
	});
var _user$project$DataModelActions$delNode = F2(
	function (n, nodes) {
		return A2(
			_elm_lang$core$List$filter,
			function (x) {
				return !_elm_lang$core$Native_Utils.eq(n.id, x.id);
			},
			nodes);
	});
var _user$project$DataModelActions$delJustNode = F2(
	function (n, model) {
		var newNodes = A2(_user$project$DataModelActions$delNode, n, model.nodes);
		return _elm_lang$core$Native_Utils.update(
			model,
			{nodes: newNodes});
	});
var _user$project$DataModelActions$canDelete = F3(
	function (n, m, model) {
		var childs_m = A2(_user$project$DataModel$childs, m, model.nodes);
		var childs_plus_m = {ctor: '::', _0: m, _1: childs_m};
		var childs_n = A2(_user$project$DataModel$childs, n, model.nodes);
		var childs_plus_n = {ctor: '::', _0: n, _1: childs_n};
		var b2 = A3(_user$project$DataModel$anyLinks, childs_plus_n, childs_m, model.edges);
		var b1 = A3(_user$project$DataModel$anyLinks, childs_plus_m, childs_n, model.edges);
		var b = !(b1 || b2);
		return b;
	});
var _user$project$DataModelActions$isLowestLevel = F2(
	function (edge, model) {
		var m_p = A2(_user$project$DataModel$getNodeFromId, edge.target, model.nodes);
		var m_n = A2(_user$project$DataModel$getNodeFromId, edge.source, model.nodes);
		var b = function () {
			var _p67 = {ctor: '_Tuple2', _0: m_n, _1: m_p};
			if ((_p67._0.ctor === 'Just') && (_p67._1.ctor === 'Just')) {
				return A3(_user$project$DataModelActions$canDelete, _p67._0._0, _p67._1._0, model);
			} else {
				return false;
			}
		}();
		return b;
	});
var _user$project$DataModelActions$lowestLevelEdges = function (model) {
	return A2(
		_elm_lang$core$List$filter,
		function (x) {
			return A2(_user$project$DataModelActions$isLowestLevel, x, model);
		},
		model.edges);
};
var _user$project$DataModelActions$delEdge = F2(
	function (edge, list) {
		return A2(
			_elm_lang$core$List$filter,
			function (x) {
				return !((_elm_lang$core$Native_Utils.eq(x.source, edge.source) && _elm_lang$core$Native_Utils.eq(x.target, edge.target)) || (_elm_lang$core$Native_Utils.eq(x.target, edge.source) && _elm_lang$core$Native_Utils.eq(x.source, edge.target)));
			},
			list);
	});
var _user$project$DataModelActions$delJustEdge = F2(
	function (edge, model) {
		var newEdges = A2(_user$project$DataModelActions$delEdge, edge, model.edges);
		return _elm_lang$core$Native_Utils.update(
			model,
			{edges: newEdges});
	});
var _user$project$DataModelActions$deleteAscN = F3(
	function (n, asc_m, model) {
		deleteAscN:
		while (true) {
			var _p68 = asc_m;
			if (_p68.ctor === '[]') {
				return model;
			} else {
				var _p71 = _p68._0;
				var m1 = function () {
					var _p69 = A3(_user$project$DataModelActions$canDelete, n, _p71, model);
					if (_p69 === true) {
						var m_e = A3(_user$project$DataModel$getEdgeFromNodesId, n.id, _p71.id, model.edges);
						var m2 = function () {
							var _p70 = m_e;
							if (_p70.ctor === 'Nothing') {
								return model;
							} else {
								return A2(_user$project$DataModelActions$delJustEdge, _p70._0, model);
							}
						}();
						return m2;
					} else {
						return model;
					}
				}();
				var _v66 = n,
					_v67 = _p68._1,
					_v68 = m1;
				n = _v66;
				asc_m = _v67;
				model = _v68;
				continue deleteAscN;
			}
		}
	});
var _user$project$DataModelActions$deleteAsc = F3(
	function (asc_n, asc_m, model) {
		deleteAsc:
		while (true) {
			var _p72 = asc_n;
			if (_p72.ctor === '[]') {
				return model;
			} else {
				var _v70 = _p72._1,
					_v71 = asc_m,
					_v72 = A3(_user$project$DataModelActions$deleteAscN, _p72._0, asc_m, model);
				asc_n = _v70;
				asc_m = _v71;
				model = _v72;
				continue deleteAsc;
			}
		}
	});
var _user$project$DataModelActions$deleteEdgeWithAsc = F3(
	function (n, m, model) {
		var commonParent = A3(_user$project$ModelManagement$findCommonParent, model.nodes, n, m);
		var asc_n = A3(_user$project$ModelManagement$getAscendants, model.nodes, n, commonParent);
		var asc_m = A3(_user$project$ModelManagement$getAscendants, model.nodes, m, commonParent);
		return A3(_user$project$DataModelActions$deleteAsc, asc_n, asc_m, model);
	});
var _user$project$DataModelActions$deleteEdgeUp = F3(
	function (n, m, model) {
		var m_e = A3(_user$project$DataModel$getEdgeFromNodesId, n.id, m.id, model.edges);
		var m3 = function () {
			var _p73 = m_e;
			if (_p73.ctor === 'Nothing') {
				return model;
			} else {
				var m0 = A2(_user$project$DataModelActions$delJustEdge, _p73._0, model);
				var m2 = A3(_user$project$DataModelActions$deleteEdgeWithAsc, n, m, m0);
				return m2;
			}
		}();
		return m3;
	});
var _user$project$DataModelActions$delEdgeFromModel_ = F3(
	function (n, m, model) {
		var m_e = A3(_user$project$DataModel$getEdgeFromNodesId, n.id, m.id, model.edges);
		var newModel = function () {
			var _p74 = m_e;
			if (_p74.ctor === 'Nothing') {
				return model;
			} else {
				return A2(_user$project$DataModelActions$delJustEdge, _p74._0, model);
			}
		}();
		return newModel;
	});
var _user$project$DataModelActions$delEdgeDownForList_ = F3(
	function (n, list, model) {
		delEdgeDownForList_:
		while (true) {
			var _p75 = list;
			if (_p75.ctor === '[]') {
				return model;
			} else {
				var _v76 = n,
					_v77 = _p75._1,
					_v78 = A3(_user$project$DataModelActions$delEdgeFromModel_, n, _p75._0, model);
				n = _v76;
				list = _v77;
				model = _v78;
				continue delEdgeDownForList_;
			}
		}
	});
var _user$project$DataModelActions$delEdgeDownForLists_ = F3(
	function (lx, ly, model) {
		delEdgeDownForLists_:
		while (true) {
			var _p76 = lx;
			if (_p76.ctor === '[]') {
				return model;
			} else {
				var _v80 = _p76._1,
					_v81 = ly,
					_v82 = A3(_user$project$DataModelActions$delEdgeDownForList_, _p76._0, ly, model);
				lx = _v80;
				ly = _v81;
				model = _v82;
				continue delEdgeDownForLists_;
			}
		}
	});
var _user$project$DataModelActions$deleteEdgeDown = F3(
	function (n, m, model) {
		var m_descendants = A2(_user$project$ModelManagement$getDescendantsFromN, model.nodes, m);
		var n_descendants = A2(_user$project$ModelManagement$getDescendantsFromN, model.nodes, n);
		var m1 = A3(_user$project$DataModelActions$delEdgeDownForLists_, n_descendants, m_descendants, model);
		return m1;
	});
var _user$project$DataModelActions$deleteEdge_ = F3(
	function (n, ext, model) {
		var m1 = A3(_user$project$DataModelActions$deleteEdgeDown, n, ext, model);
		var m2 = A3(_user$project$DataModelActions$deleteEdgeUp, n, ext, m1);
		return m2;
	});
var _user$project$DataModelActions$deleteEdge = F2(
	function (id, model) {
		var edge = A2(_user$project$DataModel$getEdgeFromId, id, model.edges);
		var m1 = function () {
			var _p77 = edge;
			if (_p77.ctor === 'Nothing') {
				return model;
			} else {
				var _p79 = _p77._0;
				var m20 = A2(_user$project$LinkParametersActions$unActivateAllParameters, _p79, model);
				var maybe_ntarget = A2(_user$project$DataModel$getNodeFromId, _p79.target, model.nodes);
				var maybe_nsrc = A2(_user$project$DataModel$getNodeFromId, _p79.source, model.nodes);
				var m2 = function () {
					var _p78 = {ctor: '_Tuple2', _0: maybe_nsrc, _1: maybe_ntarget};
					if ((_p78._0.ctor === 'Just') && (_p78._1.ctor === 'Just')) {
						var m3 = A3(_user$project$DataModelActions$deleteEdge_, _p78._0._0, _p78._1._0, m20);
						return m3;
					} else {
						return A2(_user$project$DataModelActions$delJustEdge, _p79, m20);
					}
				}();
				return m2;
			}
		}();
		return m1;
	});
var _user$project$DataModelActions$deleteEdgeFromList_ = F2(
	function (list, model) {
		deleteEdgeFromList_:
		while (true) {
			var _p80 = list;
			if (_p80.ctor === '::') {
				var _v86 = _p80._1,
					_v87 = A2(_user$project$DataModelActions$deleteEdge, _p80._0.id, model);
				list = _v86;
				model = _v87;
				continue deleteEdgeFromList_;
			} else {
				return model;
			}
		}
	});
var _user$project$DataModelActions$deleteEdgesAndNode_ = F2(
	function (n, model) {
		var edgesToDelete = A2(
			_elm_lang$core$List$filter,
			function (x) {
				return _elm_lang$core$Native_Utils.eq(x.source, n.id) || _elm_lang$core$Native_Utils.eq(x.target, n.id);
			},
			model.edges);
		var m1 = A2(_user$project$DataModelActions$deleteEdgeFromList_, edgesToDelete, model);
		var m2 = A2(_user$project$DataModelActions$delJustNode, n, m1);
		return m2;
	});
var _user$project$DataModelActions$deleteEdgesAndNodeFromListNode_ = F2(
	function (list, model) {
		deleteEdgesAndNodeFromListNode_:
		while (true) {
			var _p81 = list;
			if (_p81.ctor === '::') {
				var m1 = A2(_user$project$DataModelActions$deleteEdgesAndNode_, _p81._0, model);
				var _v89 = _p81._1,
					_v90 = m1;
				list = _v89;
				model = _v90;
				continue deleteEdgesAndNodeFromListNode_;
			} else {
				return model;
			}
		}
	});
var _user$project$DataModelActions$deleteNode = F2(
	function (id, model) {
		var maybe_n = A2(_user$project$DataModel$getNodeFromId, id, model.nodes);
		var m1 = function () {
			var _p82 = maybe_n;
			if (_p82.ctor === 'Just') {
				var descendants = A2(_user$project$ModelManagement$getDescendantsFromN, model.nodes, _p82._0);
				var m2 = A2(_user$project$DataModelActions$deleteEdgesAndNodeFromListNode_, descendants, model);
				return m2;
			} else {
				return model;
			}
		}();
		return m1;
	});
var _user$project$DataModelActions$process_ = F3(
	function (s, id, n) {
		var n1 = function () {
			var _p83 = id;
			if (_p83.ctor === 'Nothing') {
				return n;
			} else {
				var _p84 = _elm_lang$core$Native_Utils.eq(n.id, _p83._0);
				if (_p84 === true) {
					return _elm_lang$core$Native_Utils.update(
						n,
						{name: s});
				} else {
					return n;
				}
			}
		}();
		return n1;
	});
var _user$project$DataModelActions$renameNodeInList_ = F3(
	function (s, id, list) {
		return A2(
			_elm_lang$core$List$map,
			A2(_user$project$DataModelActions$process_, s, id),
			list);
	});
var _user$project$DataModelActions$renameNode = F3(
	function (s, m_nId, model) {
		var newNodes = A3(_user$project$DataModelActions$renameNodeInList_, s, m_nId, model.nodes);
		return _elm_lang$core$Native_Utils.update(
			model,
			{nodes: newNodes});
	});
var _user$project$DataModelActions$renameNode_ = F2(
	function (n, s) {
		return _elm_lang$core$Native_Utils.update(
			n,
			{name: s});
	});
var _user$project$DataModelActions$createAtomicEdge_ = F3(
	function (src, dest, model) {
		var edge = A2(_user$project$Link$link, src, dest);
		var dataModelNewId = function () {
			var _p85 = A2(_user$project$DataModel$isEdgePresent, edge, model.edges);
			if (_p85 === true) {
				return model;
			} else {
				var m1 = _user$project$DataModel$getNodeIdentifier(model);
				var e1 = _elm_lang$core$Native_Utils.update(
					edge,
					{id: m1.curNodeId});
				var newEdges = {ctor: '::', _0: e1, _1: m1.edges};
				return _elm_lang$core$Native_Utils.update(
					m1,
					{edges: newEdges});
			}
		}();
		return dataModelNewId;
	});
var _user$project$DataModelActions$createAtomicDoubleEdge_ = F3(
	function (src, dest, model) {
		return A3(_user$project$DataModelActions$createAtomicEdge_, src, dest, model);
	});
var _user$project$DataModelActions$createAtomicEdgeForList_ = F3(
	function (list, dest, model) {
		createAtomicEdgeForList_:
		while (true) {
			var _p86 = list;
			if (_p86.ctor === '::') {
				var m1 = A3(_user$project$DataModelActions$createAtomicDoubleEdge_, _p86._0.id, dest, model);
				var _v96 = _p86._1,
					_v97 = dest,
					_v98 = m1;
				list = _v96;
				dest = _v97;
				model = _v98;
				continue createAtomicEdgeForList_;
			} else {
				return model;
			}
		}
	});
var _user$project$DataModelActions$createLinkEdgeForLists_ = F3(
	function (ls, lt, model) {
		createLinkEdgeForLists_:
		while (true) {
			var _p87 = ls;
			if (_p87.ctor === '[]') {
				return model;
			} else {
				var _v100 = _p87._1,
					_v101 = lt,
					_v102 = A3(_user$project$DataModelActions$createAtomicEdgeForList_, lt, _p87._0.id, model);
				ls = _v100;
				lt = _v101;
				model = _v102;
				continue createLinkEdgeForLists_;
			}
		}
	});
var _user$project$DataModelActions$createLink_ = F3(
	function (ns1, nt1, model) {
		var commonParent = A3(_user$project$ModelManagement$findCommonParent, model.nodes, ns1, nt1);
		var ldt1 = A3(_user$project$ModelManagement$getAscendants, model.nodes, nt1, commonParent);
		var lds1 = A3(_user$project$ModelManagement$getAscendants, model.nodes, ns1, commonParent);
		var m2 = A3(_user$project$DataModelActions$createLinkEdgeForLists_, lds1, ldt1, model);
		return m2;
	});
var _user$project$DataModelActions$createLink = F3(
	function (s, t, model) {
		var nt = A2(_user$project$DataModel$getNodeFromId, t, model.nodes);
		var ns = A2(_user$project$DataModel$getNodeFromId, s, model.nodes);
		var newModel = function () {
			var _p88 = {ctor: '_Tuple2', _0: ns, _1: nt};
			if ((_p88._0.ctor === 'Just') && (_p88._1.ctor === 'Just')) {
				return A3(_user$project$DataModelActions$createLink_, _p88._0._0, _p88._1._0, model);
			} else {
				return model;
			}
		}();
		return newModel;
	});
var _user$project$DataModelActions$createLinksRecursive_ = F2(
	function (list, model) {
		createLinksRecursive_:
		while (true) {
			var _p89 = list;
			if (_p89.ctor === '[]') {
				return model;
			} else {
				var _p90 = _p89._0;
				var _v105 = _p89._1,
					_v106 = A3(_user$project$DataModelActions$createLink, _p90.source, _p90.target, model);
				list = _v105;
				model = _v106;
				continue createLinksRecursive_;
			}
		}
	});
var _user$project$DataModelActions$createLinks_ = F2(
	function (list, model) {
		var m1 = A2(_user$project$DataModelActions$createLinksRecursive_, list, model);
		var m2 = A2(_user$project$LinkParametersActions$activateParameters, list, m1);
		return m2;
	});
var _user$project$DataModelActions$insertFromTmp = F4(
	function (m_s, m_id, tmp, model) {
		var maxId = _user$project$DataModel$getCurIdFromModel(model) + 1;
		var tmpDataModel = A2(_user$project$TranslateTmpDataModel$translateDataModel, maxId, tmp);
		var m0 = function () {
			var _p91 = m_id;
			if (_p91.ctor === 'Nothing') {
				return model;
			} else {
				var newId = _p91._0 + maxId;
				var n0Nodes = A2(
					_elm_lang$core$List$map,
					function (x) {
						var _p92 = _elm_lang$core$Native_Utils.eq(x.id, newId);
						if (_p92 === true) {
							return _elm_lang$core$Native_Utils.update(
								x,
								{parent: m_s});
						} else {
							return x;
						}
					},
					tmpDataModel.nodes);
				var n1Nodes = _elm_lang$core$List$concat(
					{
						ctor: '::',
						_0: model.nodes,
						_1: {
							ctor: '::',
							_0: n0Nodes,
							_1: {ctor: '[]'}
						}
					});
				var m1 = _elm_lang$core$Native_Utils.update(
					model,
					{nodes: n1Nodes});
				var m2 = A2(_user$project$GroupsActions$addGroupsToNodes, n0Nodes, m1);
				var newCurId = _user$project$DataModel$getCurIdFromModel(m2);
				var m3 = _elm_lang$core$Native_Utils.update(
					m2,
					{curNodeId: newCurId});
				var newEdges = A2(
					_elm_lang$core$List$filter,
					function (x) {
						return A3(_user$project$DataModelActions$filterEdge_, x, newId, m2.nodes);
					},
					tmpDataModel.edges);
				var m4 = A2(_user$project$DataModelActions$createLinks_, newEdges, m3);
				return m4;
			}
		}();
		return m0;
	});
var _user$project$DataModelActions$createNode = F3(
	function (name, m_parent, model) {
		var newDataModel = _user$project$DataModel$getNodeIdentifier(model);
		var newId = newDataModel.curNodeId;
		var node = A3(_user$project$Node$node, newId, name, m_parent);
		var nodeWithRoles = A2(_user$project$Node$initRoles, node, model.parameters);
		var newNodes = {ctor: '::', _0: nodeWithRoles, _1: newDataModel.nodes};
		return _elm_lang$core$Native_Utils.update(
			newDataModel,
			{nodes: newNodes});
	});
var _user$project$DataModelActions$makeGroupNodes_ = F4(
	function (list, s, m_p, model) {
		var m1 = A3(_user$project$DataModelActions$createNode, s, m_p, model);
		var fatherId = m1.curNodeId;
		var newNodes = A2(
			_elm_lang$core$List$map,
			function (x) {
				var _p93 = A2(_user$project$DataModel$isNodePresent, x, list);
				if (_p93 === true) {
					return _elm_lang$core$Native_Utils.update(
						x,
						{
							parent: _elm_lang$core$Maybe$Just(fatherId)
						});
				} else {
					return x;
				}
			},
			m1.nodes);
		var edges1 = A2(
			_elm_lang$core$List$filter,
			function (x) {
				return A2(_user$project$DataModel$isNodeIdPresent, x.source, list) && (!A3(_user$project$DataModelActions$isDescendantOneOfList_, x.target, list, model));
			},
			m1.edges);
		var edges11 = A2(
			_elm_lang$core$List$map,
			function (x) {
				return _elm_lang$core$Native_Utils.update(
					x,
					{source: fatherId});
			},
			edges1);
		var edges2 = A2(
			_elm_lang$core$List$filter,
			function (x) {
				return A2(_user$project$DataModel$isNodeIdPresent, x.target, list) && (!A3(_user$project$DataModelActions$isDescendantOneOfList_, x.source, list, model));
			},
			m1.edges);
		var edges21 = A2(
			_elm_lang$core$List$map,
			function (x) {
				return _elm_lang$core$Native_Utils.update(
					x,
					{target: fatherId});
			},
			edges2);
		var edgesTocreate = A2(_elm_lang$core$List$append, edges11, edges21);
		var m2 = _elm_lang$core$Native_Utils.update(
			m1,
			{nodes: newNodes});
		var m3 = A2(_user$project$DataModelActions$duplicateEdgesFromList, edgesTocreate, m2);
		return m3;
	});
var _user$project$DataModelActions$groupNodes = F3(
	function (list, s, model) {
		var _p94 = _user$project$DataModel$nodeListSameParent(list);
		var condition = _p94._0;
		var parent = _p94._1;
		var m1 = function () {
			var _p95 = condition;
			if (_p95 === false) {
				return model;
			} else {
				return A4(_user$project$DataModelActions$makeGroupNodes_, list, s, parent, model);
			}
		}();
		return m1;
	});

var _user$project$Export$isActiveProperty = F2(
	function (list, p) {
		return A2(_elm_lang$core$Set$member, p.id, list);
	});
var _user$project$Export$listToString = F2(
	function (list, groups) {
		var _p0 = list;
		if (_p0.ctor === '[]') {
			return '';
		} else {
			var _p3 = _p0._1;
			var _p1 = A2(_user$project$Groups$getPropertyStringFromId, _p0._0, groups);
			if (_p1.ctor === 'Nothing') {
				return '';
			} else {
				return A2(
					_elm_lang$core$Basics_ops['++'],
					_p1._0,
					function () {
						var _p2 = _p3;
						if (_p2.ctor === '[]') {
							return '';
						} else {
							return A2(
								_elm_lang$core$Basics_ops['++'],
								', ',
								A2(_user$project$Export$listToString, _p3, groups));
						}
					}());
			}
		}
	});
var _user$project$Export$functionalChainToString = F2(
	function (ens, groups) {
		return A2(
			_user$project$Export$listToString,
			_elm_lang$core$Set$toList(ens),
			groups);
	});
var _user$project$Export$attributToString = function (at) {
	var _p4 = at;
	if (_p4.ctor === 'Nothing') {
		return 'Nothing';
	} else {
		return _p4._0;
	}
};
var _user$project$Export$cr = '\n';
var _user$project$Export$nodeEncode_ = F2(
	function (n, model) {
		return A2(
			_elm_lang$core$Basics_ops['++'],
			A2(_user$project$DataModelActions$getAscendantName, n, model),
			A2(
				_elm_lang$core$Basics_ops['++'],
				_user$project$Export$cr,
				A2(
					_elm_lang$core$Basics_ops['++'],
					_user$project$Export$attributToString(n.attribut),
					A2(
						_elm_lang$core$Basics_ops['++'],
						_user$project$Export$cr,
						A2(_user$project$Export$functionalChainToString, n.group, model.groups)))));
	});
var _user$project$Export$nodeListEncode_ = F2(
	function (list, model) {
		var _p5 = list;
		if (_p5.ctor === '[]') {
			return '';
		} else {
			return A2(
				_elm_lang$core$Basics_ops['++'],
				A2(_user$project$Export$nodeEncode_, _p5._0, model),
				A2(
					_elm_lang$core$Basics_ops['++'],
					_user$project$Export$cr,
					A2(
						_elm_lang$core$Basics_ops['++'],
						_user$project$Export$cr,
						A2(_user$project$Export$nodeListEncode_, _p5._1, model))));
		}
	});
var _user$project$Export$encodeNodes = function (model) {
	var list = _user$project$ModelManagement$orderingNodesToPBS(model);
	return A2(_user$project$Export$nodeListEncode_, list, model);
};
var _user$project$Export$slash = '/';
var _user$project$Export$separator = ';';
var _user$project$Export$propagationNodeEncode = F3(
	function (node, stateSummary, model) {
		var state = A2(_elm_lang$core$Set$member, node.id, stateSummary.ko) ? 'KO' : (A2(_elm_lang$core$Set$member, node.id, stateSummary.affected) ? 'Impacted' : 'OK');
		return A2(
			_elm_lang$core$Basics_ops['++'],
			A2(_user$project$DataModelActions$getAscendantName, node, model),
			A2(_elm_lang$core$Basics_ops['++'], _user$project$Export$separator, state));
	});
var _user$project$Export$propagationEncode = F3(
	function (list, stateSummary, model) {
		var _p6 = list;
		if (_p6.ctor === '[]') {
			return '';
		} else {
			return A2(
				_elm_lang$core$Basics_ops['++'],
				A3(_user$project$Export$propagationNodeEncode, _p6._0, stateSummary, model),
				A2(
					_elm_lang$core$Basics_ops['++'],
					_user$project$Export$cr,
					A3(_user$project$Export$propagationEncode, _p6._1, stateSummary, model)));
		}
	});
var _user$project$Export$encodePropagation = function (model) {
	var stateSummary = A3(
		_user$project$Propagation$getStateSummary,
		model.nodes,
		model.edges,
		A2(
			_elm_lang$core$List$map,
			function (_) {
				return _.id;
			},
			model.parameters));
	var orderedNodes = _user$project$ModelManagement$orderingNodesToPBS(model);
	return A3(_user$project$Export$propagationEncode, orderedNodes, stateSummary, model);
};
var _user$project$Export$propertiesToCSV = F3(
	function (lId, list, s) {
		var _p7 = list;
		if (_p7.ctor === '[]') {
			return s;
		} else {
			var _p12 = _p7._1;
			var res = function () {
				var _p8 = A2(_user$project$Export$isActiveProperty, lId, _p7._0);
				if (_p8 === true) {
					return '1';
				} else {
					return '0';
				}
			}();
			var s1 = function () {
				var _p9 = _elm_lang$core$List$length(_p12);
				if (_p9 === 0) {
					var _p10 = _elm_lang$core$String$length(s);
					if (_p10 === 0) {
						return res;
					} else {
						return A2(
							_elm_lang$core$Basics_ops['++'],
							s,
							A2(_elm_lang$core$Basics_ops['++'], _user$project$Export$separator, res));
					}
				} else {
					var _p11 = _elm_lang$core$String$length(s);
					if (_p11 === 0) {
						return A3(_user$project$Export$propertiesToCSV, lId, _p12, res);
					} else {
						return A3(
							_user$project$Export$propertiesToCSV,
							lId,
							_p12,
							A2(
								_elm_lang$core$Basics_ops['++'],
								s,
								A2(_elm_lang$core$Basics_ops['++'], _user$project$Export$separator, res)));
					}
				}
			}();
			return s1;
		}
	});
var _user$project$Export$parametersToCSV = F2(
	function (parameters, model) {
		return A3(_user$project$Export$propertiesToCSV, parameters, model.parameters, '');
	});
var _user$project$Export$edgeToCSV = F2(
	function (edge, model) {
		var m_t = A2(_user$project$DataModel$getNodeFromId, edge.target, model.nodes);
		var m_s = A2(_user$project$DataModel$getNodeFromId, edge.source, model.nodes);
		var s = function () {
			var _p13 = {ctor: '_Tuple2', _0: m_s, _1: m_t};
			if ((_p13._0.ctor === 'Just') && (_p13._1.ctor === 'Just')) {
				return A2(
					_elm_lang$core$Basics_ops['++'],
					A2(_user$project$DataModelActions$getAscendantName, _p13._0._0, model),
					A2(
						_elm_lang$core$Basics_ops['++'],
						_user$project$Export$separator,
						A2(
							_elm_lang$core$Basics_ops['++'],
							A2(_user$project$DataModelActions$getAscendantName, _p13._1._0, model),
							A2(
								_elm_lang$core$Basics_ops['++'],
								_user$project$Export$separator,
								A2(
									_elm_lang$core$Basics_ops['++'],
									A2(_user$project$Export$parametersToCSV, edge.parameters, model),
									A2(
										_elm_lang$core$Basics_ops['++'],
										_user$project$Export$separator,
										_user$project$Export$attributToString(edge.attribut)))))));
			} else {
				return 'ERREUR;;;;;;;;;;;;';
			}
		}();
		return s;
	});
var _user$project$Export$edgeListEncode_ = F2(
	function (list, model) {
		var _p14 = list;
		if (_p14.ctor === '[]') {
			return '';
		} else {
			return A2(
				_elm_lang$core$Basics_ops['++'],
				A2(_user$project$Export$edgeToCSV, _p14._0, model),
				A2(
					_elm_lang$core$Basics_ops['++'],
					_user$project$Export$cr,
					A2(_user$project$Export$edgeListEncode_, _p14._1, model)));
		}
	});
var _user$project$Export$parametersHeader_ = function (list) {
	var _p15 = list;
	if (_p15.ctor === '[]') {
		return 'parameters';
	} else {
		var _p18 = _p15._1;
		var _p17 = _p15._0;
		var _p16 = _elm_lang$core$List$length(_p18);
		if (_p16 === 0) {
			return _p17.name;
		} else {
			return A2(
				_elm_lang$core$Basics_ops['++'],
				_p17.name,
				A2(
					_elm_lang$core$Basics_ops['++'],
					_user$project$Export$separator,
					_user$project$Export$parametersHeader_(_p18)));
		}
	}
};
var _user$project$Export$parametersHeader = function (model) {
	return _user$project$Export$parametersHeader_(model.parameters);
};
var _user$project$Export$edgesEncodeHeader = function (model) {
	return A2(
		_elm_lang$core$Basics_ops['++'],
		'source',
		A2(
			_elm_lang$core$Basics_ops['++'],
			_user$project$Export$separator,
			A2(
				_elm_lang$core$Basics_ops['++'],
				'target',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_user$project$Export$separator,
					A2(
						_elm_lang$core$Basics_ops['++'],
						_user$project$Export$parametersHeader(model),
						A2(_elm_lang$core$Basics_ops['++'], _user$project$Export$separator, 'attribut'))))));
};
var _user$project$Export$encodeLinks = function (model) {
	return A2(
		_elm_lang$core$Basics_ops['++'],
		_user$project$Export$edgesEncodeHeader(model),
		A2(
			_elm_lang$core$Basics_ops['++'],
			_user$project$Export$cr,
			A2(_user$project$Export$edgeListEncode_, model.edges, model)));
};

var _user$project$LayoutMenu$defaultModel = {
	layout: _elm_lang$core$Maybe$Just('dagre')
};
var _user$project$LayoutMenu$Model = function (a) {
	return {layout: a};
};

var _user$project$LayoutMenuActions$layoutPicked = F2(
	function (s, model) {
		var newLayout = _elm_lang$core$Maybe$Just(s);
		return _elm_lang$core$Native_Utils.update(
			model,
			{layout: newLayout});
	});

var _user$project$LinkToJS$makeJsData = F2(
	function (tag, data) {
		return {tag: tag, data: data};
	});
var _user$project$LinkToJS$msg2js = _elm_lang$core$Native_Platform.outgoingPort(
	'msg2js',
	function (v) {
		return {tag: v.tag, data: v.data};
	});
var _user$project$LinkToJS$sendParentSelection = _elm_lang$core$Native_Platform.outgoingPort(
	'sendParentSelection',
	function (v) {
		return v;
	});
var _user$project$LinkToJS$layout = _elm_lang$core$Native_Platform.outgoingPort(
	'layout',
	function (v) {
		return v;
	});
var _user$project$LinkToJS$saveModel = _elm_lang$core$Native_Platform.outgoingPort(
	'saveModel',
	function (v) {
		return v;
	});
var _user$project$LinkToJS$loadModel = _elm_lang$core$Native_Platform.outgoingPort(
	'loadModel',
	function (v) {
		return v;
	});
var _user$project$LinkToJS$exportLNK = _elm_lang$core$Native_Platform.outgoingPort(
	'exportLNK',
	function (v) {
		return v;
	});
var _user$project$LinkToJS$requestpositions = _elm_lang$core$Native_Platform.outgoingPort(
	'requestpositions',
	function (v) {
		return v;
	});
var _user$project$LinkToJS$onOpen = _elm_lang$core$Native_Platform.outgoingPort(
	'onOpen',
	function (v) {
		return v;
	});
var _user$project$LinkToJS$importModel = _elm_lang$core$Native_Platform.outgoingPort(
	'importModel',
	function (v) {
		return v;
	});
var _user$project$LinkToJS$onImport = _elm_lang$core$Native_Platform.outgoingPort(
	'onImport',
	function (v) {
		return v;
	});
var _user$project$LinkToJS$saveToImage = _elm_lang$core$Native_Platform.outgoingPort(
	'saveToImage',
	function (v) {
		return v;
	});
var _user$project$LinkToJS$loadGeometryRequest = _elm_lang$core$Native_Platform.outgoingPort(
	'loadGeometryRequest',
	function (v) {
		return _elm_lang$core$Native_List.toArray(v).map(
			function (v) {
				return v;
			});
	});
var _user$project$LinkToJS$loadGeometryButton = _elm_lang$core$Native_Platform.outgoingPort(
	'loadGeometryButton',
	function (v) {
		return v;
	});
var _user$project$LinkToJS$setLayoutName = _elm_lang$core$Native_Platform.outgoingPort(
	'setLayoutName',
	function (v) {
		return v;
	});
var _user$project$LinkToJS$setLayoutNameThenLayout = _elm_lang$core$Native_Platform.outgoingPort(
	'setLayoutNameThenLayout',
	function (v) {
		return v;
	});
var _user$project$LinkToJS$selection = _elm_lang$core$Native_Platform.incomingPort(
	'selection',
	_elm_lang$core$Json_Decode$list(_elm_lang$core$Json_Decode$string));
var _user$project$LinkToJS$modeltoelm = _elm_lang$core$Native_Platform.incomingPort('modeltoelm', _elm_lang$core$Json_Decode$string);
var _user$project$LinkToJS$csvmodeltoelm = _elm_lang$core$Native_Platform.incomingPort('csvmodeltoelm', _elm_lang$core$Json_Decode$string);
var _user$project$LinkToJS$csv2modeltoelm = _elm_lang$core$Native_Platform.incomingPort('csv2modeltoelm', _elm_lang$core$Json_Decode$string);
var _user$project$LinkToJS$importModeltoelm = _elm_lang$core$Native_Platform.incomingPort('importModeltoelm', _elm_lang$core$Json_Decode$string);
var _user$project$LinkToJS$importCsvModeltoelm = _elm_lang$core$Native_Platform.incomingPort('importCsvModeltoelm', _elm_lang$core$Json_Decode$string);
var _user$project$LinkToJS$doubleclick = _elm_lang$core$Native_Platform.incomingPort('doubleclick', _elm_lang$core$Json_Decode$string);
var _user$project$LinkToJS$nodesPositionToElm = _elm_lang$core$Native_Platform.incomingPort('nodesPositionToElm', _elm_lang$core$Json_Decode$string);
var _user$project$LinkToJS$nodesPositionRequest = _elm_lang$core$Native_Platform.incomingPort('nodesPositionRequest', _elm_lang$core$Json_Decode$string);
var _user$project$LinkToJS$sendGeometryToElm = _elm_lang$core$Native_Platform.incomingPort('sendGeometryToElm', _elm_lang$core$Json_Decode$string);
var _user$project$LinkToJS$JsData = F2(
	function (a, b) {
		return {tag: a, data: b};
	});

var _user$project$DataModelDecoders$strToState = function (state) {
	var _p0 = state;
	switch (_p0) {
		case 'RAS':
			return _user$project$ElementAttributes$RAS;
		case 'HS':
			return _user$project$ElementAttributes$HS;
		default:
			return _user$project$ElementAttributes$StateUnknown;
	}
};
var _user$project$DataModelDecoders$decodeState = A2(_elm_lang$core$Json_Decode$map, _user$project$DataModelDecoders$strToState, _elm_lang$core$Json_Decode$string);
var _user$project$DataModelDecoders$decodeRole = function () {
	var strToRole = function (role) {
		var _p1 = role;
		switch (_p1) {
			case 'producer':
				return _user$project$ElementAttributes$Producer;
			case 'consumer':
				return _user$project$ElementAttributes$Consumer;
			default:
				return _user$project$ElementAttributes$RoleUnknown;
		}
	};
	return A2(_elm_lang$core$Json_Decode$map, strToRole, _elm_lang$core$Json_Decode$string);
}();
var _user$project$DataModelDecoders$decodePosition = A3(
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
	'y',
	_elm_lang$core$Json_Decode$float,
	A3(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
		'x',
		_elm_lang$core$Json_Decode$float,
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_user$project$Position$Position)));
var _user$project$DataModelDecoders$decodeAttribut = _elm_lang$core$Json_Decode$string;
var _user$project$DataModelDecoders$decodeIdentifier = _elm_lang$core$Json_Decode$int;
var _user$project$DataModelDecoders$decodeNetworkRole = A3(
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
	'role',
	_user$project$DataModelDecoders$decodeRole,
	A3(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
		'network',
		_user$project$DataModelDecoders$decodeIdentifier,
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_user$project$ElementAttributes$NetworkRole)));
var _user$project$DataModelDecoders$decodeRoles = _elm_lang$core$Json_Decode$list(_user$project$DataModelDecoders$decodeNetworkRole);
var _user$project$DataModelDecoders$decodeNode = A2(
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$hardcoded,
	false,
	A4(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optional,
		'position',
		_user$project$DataModelDecoders$decodePosition,
		_user$project$Position$defaultPosition,
		A2(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$hardcoded,
			0,
			A3(
				_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
				'group',
				_elm_community$json_extra$Json_Decode_Extra$set(_user$project$DataModelDecoders$decodeIdentifier),
				A4(
					_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optional,
					'geometry',
					_elm_lang$core$Json_Decode$maybe(_user$project$DataModelDecoders$decodeIdentifier),
					_elm_lang$core$Maybe$Nothing,
					A4(
						_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optional,
						'roles',
						_user$project$DataModelDecoders$decodeRoles,
						{ctor: '[]'},
						A4(
							_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optional,
							'state',
							_user$project$DataModelDecoders$decodeState,
							_user$project$ElementAttributes$StateUnknown,
							A3(
								_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
								'attribut',
								_elm_lang$core$Json_Decode$maybe(_user$project$DataModelDecoders$decodeAttribut),
								A3(
									_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
									'parent',
									_elm_lang$core$Json_Decode$maybe(_user$project$DataModelDecoders$decodeIdentifier),
									A3(
										_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
										'name',
										_elm_lang$core$Json_Decode$string,
										A3(
											_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
											'id',
											_user$project$DataModelDecoders$decodeIdentifier,
											_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_user$project$Node$Node))))))))))));
var _user$project$DataModelDecoders$decodeDataNode = A3(
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
	'data',
	_user$project$DataModelDecoders$decodeNode,
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_user$project$DataModel$DataNode));
var _user$project$DataModelDecoders$decodeNodes = _elm_lang$core$Json_Decode$list(_user$project$DataModelDecoders$decodeDataNode);
var _user$project$DataModelDecoders$decodeActiveProperties = _elm_community$json_extra$Json_Decode_Extra$set(_user$project$DataModelDecoders$decodeIdentifier);
var _user$project$DataModelDecoders$decodeEdge = A4(
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optional,
	'tightness',
	_elm_community$json_extra$Json_Decode_Extra$set(_user$project$DataModelDecoders$decodeIdentifier),
	_elm_lang$core$Set$empty,
	A2(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$hardcoded,
		0,
		A3(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
			'attribut',
			_elm_lang$core$Json_Decode$maybe(_user$project$DataModelDecoders$decodeAttribut),
			A4(
				_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optional,
				'state',
				_user$project$DataModelDecoders$decodeState,
				_user$project$ElementAttributes$StateUnknown,
				A3(
					_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
					'parameters',
					_elm_community$json_extra$Json_Decode_Extra$set(_user$project$DataModelDecoders$decodeIdentifier),
					A3(
						_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
						'target',
						_user$project$DataModelDecoders$decodeIdentifier,
						A3(
							_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
							'source',
							_user$project$DataModelDecoders$decodeIdentifier,
							A3(
								_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
								'id',
								_user$project$DataModelDecoders$decodeIdentifier,
								_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_user$project$Link$Edge)))))))));
var _user$project$DataModelDecoders$decodeDataEdge = A3(
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
	'data',
	_user$project$DataModelDecoders$decodeEdge,
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_user$project$DataModel$DataEdge));
var _user$project$DataModelDecoders$decodeEdges = _elm_lang$core$Json_Decode$list(_user$project$DataModelDecoders$decodeDataEdge);
var _user$project$DataModelDecoders$decodeProperty = A3(
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
	'name',
	_elm_lang$core$Json_Decode$string,
	A3(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
		'id',
		_user$project$DataModelDecoders$decodeIdentifier,
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_user$project$LinkParameters$Property)));
var _user$project$DataModelDecoders$decodeParameters = _elm_lang$core$Json_Decode$list(_user$project$DataModelDecoders$decodeProperty);
var _user$project$DataModelDecoders$decodeGroupProperty = A3(
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
	'name',
	_elm_lang$core$Json_Decode$string,
	A3(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
		'id',
		_user$project$DataModelDecoders$decodeIdentifier,
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_user$project$Groups$Property)));
var _user$project$DataModelDecoders$decodeGroups = _elm_lang$core$Json_Decode$list(_user$project$DataModelDecoders$decodeGroupProperty);
var _user$project$DataModelDecoders$decodeGeometryProperty = A4(
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optional,
	'svg',
	_elm_lang$core$Json_Decode$maybe(_elm_lang$core$Json_Decode$string),
	_elm_lang$core$Maybe$Nothing,
	A3(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
		'name',
		_elm_lang$core$Json_Decode$string,
		A3(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
			'id',
			_user$project$DataModelDecoders$decodeIdentifier,
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_user$project$Geometries$Property))));
var _user$project$DataModelDecoders$decodeGeometries = _elm_lang$core$Json_Decode$list(_user$project$DataModelDecoders$decodeGeometryProperty);
var _user$project$DataModelDecoders$decodeNodePosition = A3(
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
	'position',
	_user$project$DataModelDecoders$decodePosition,
	A3(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
		'id',
		_user$project$DataModelDecoders$decodeIdentifier,
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_user$project$Position$NodePosition)));
var _user$project$DataModelDecoders$decodeLayout = _elm_lang$core$Json_Decode$list(_user$project$DataModelDecoders$decodeNodePosition);
var _user$project$DataModelDecoders$decodeNodeLayout = A3(
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
	'layout',
	_user$project$DataModelDecoders$decodeLayout,
	A3(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
		'id',
		_user$project$DataModelDecoders$decodeIdentifier,
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_user$project$Layout$NodeLayout)));
var _user$project$DataModelDecoders$decodeGeometryLayout = A3(
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
	'layout',
	_user$project$DataModelDecoders$decodeLayout,
	A3(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
		'id',
		_user$project$DataModelDecoders$decodeIdentifier,
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_user$project$Layout$GeometryLayout)));
var _user$project$DataModelDecoders$decodeDataModel = A4(
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optional,
	'geometryImage',
	_elm_lang$core$Json_Decode$maybe(_elm_lang$core$Json_Decode$string),
	_elm_lang$core$Maybe$Nothing,
	A4(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optional,
		'mask',
		_elm_community$json_extra$Json_Decode_Extra$set(_user$project$DataModelDecoders$decodeIdentifier),
		_elm_lang$core$Set$empty,
		A4(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optional,
			'rootBubbleLayout',
			_elm_lang$core$Json_Decode$maybe(_user$project$DataModelDecoders$decodeLayout),
			_elm_lang$core$Maybe$Nothing,
			A4(
				_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optional,
				'lightLayout',
				_elm_lang$core$Json_Decode$maybe(_user$project$DataModelDecoders$decodeLayout),
				_elm_lang$core$Maybe$Nothing,
				A4(
					_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optional,
					'geometryLayouts',
					_elm_lang$core$Json_Decode$list(_user$project$DataModelDecoders$decodeGeometryLayout),
					{ctor: '[]'},
					A4(
						_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optional,
						'layouts',
						_elm_lang$core$Json_Decode$list(_user$project$DataModelDecoders$decodeNodeLayout),
						{ctor: '[]'},
						A4(
							_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optional,
							'selectedParameters',
							_elm_community$json_extra$Json_Decode_Extra$set(_user$project$DataModelDecoders$decodeIdentifier),
							_elm_lang$core$Set$empty,
							A4(
								_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optional,
								'lightedGeometry',
								_elm_lang$core$Json_Decode$maybe(_elm_lang$core$Json_Decode$int),
								_elm_lang$core$Maybe$Nothing,
								A4(
									_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optional,
									'lightedGroup',
									_elm_lang$core$Json_Decode$maybe(_elm_lang$core$Json_Decode$int),
									_elm_lang$core$Maybe$Nothing,
									A4(
										_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optional,
										'geometries',
										_user$project$DataModelDecoders$decodeGeometries,
										{ctor: '[]'},
										A3(
											_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
											'groups',
											_user$project$DataModelDecoders$decodeGroups,
											A3(
												_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
												'parameters',
												_user$project$DataModelDecoders$decodeParameters,
												A3(
													_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
													'edges',
													_user$project$DataModelDecoders$decodeEdges,
													A3(
														_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
														'nodes',
														_user$project$DataModelDecoders$decodeNodes,
														_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_user$project$DataModel$DataModel)))))))))))))));
var _user$project$DataModelDecoders$decodeNodesPosition = _elm_lang$core$Json_Decode$list(_user$project$DataModelDecoders$decodeNodePosition);

var _user$project$Selection$updateModelSelection = F2(
	function (model, list) {
		var noError = A2(
			_elm_lang$core$List$all,
			function (s) {
				return !s.err;
			},
			list);
		var newModel = function () {
			var _p0 = noError;
			if (_p0 === true) {
				return A2(
					_elm_lang$core$List$map,
					function (s) {
						return s.id;
					},
					list);
			} else {
				return model;
			}
		}();
		return newModel;
	});
var _user$project$Selection$getFirstSelectionIdentifier = function (model) {
	var _p1 = model;
	if (_p1.ctor === '[]') {
		return _elm_lang$core$Maybe$Nothing;
	} else {
		return _elm_lang$core$Maybe$Just(_p1._0);
	}
};
var _user$project$Selection$getIdentifier = function (s) {
	return s.id;
};
var _user$project$Selection$selection = F2(
	function (i, b) {
		return {id: i, err: b};
	});
var _user$project$Selection$decodeFromJSId = function (s) {
	var x = A2(
		_elm_lang$core$Json_Decode$decodeString,
		A2(_elm_lang$core$Json_Decode$field, 'id', _user$project$DataModelDecoders$decodeIdentifier),
		s);
	var select = function () {
		var _p2 = x;
		if (_p2.ctor === 'Ok') {
			return A2(_user$project$Selection$selection, _p2._0, false);
		} else {
			return A2(_user$project$Selection$selection, -1, true);
		}
	}();
	return select;
};
var _user$project$Selection$decodeFromJSMsg = _elm_lang$core$List$map(_user$project$Selection$decodeFromJSId);
var _user$project$Selection$SelectionId = F2(
	function (a, b) {
		return {id: a, err: b};
	});

var _user$project$Scenario$addMsg = F2(
	function (msg, model) {
		return {ctor: '::', _0: msg, _1: model};
	});
var _user$project$Scenario$defaultRedoModel = _elm_lang$core$Maybe$Nothing;
var _user$project$Scenario$defaultModel = {ctor: '[]'};
var _user$project$Scenario$LoadCsv2Model = function (a) {
	return {ctor: 'LoadCsv2Model', _0: a};
};
var _user$project$Scenario$LoadCsvModel = function (a) {
	return {ctor: 'LoadCsvModel', _0: a};
};
var _user$project$Scenario$SendGeometryName = function (a) {
	return {ctor: 'SendGeometryName', _0: a};
};
var _user$project$Scenario$CtrlV = function (a) {
	return {ctor: 'CtrlV', _0: a};
};
var _user$project$Scenario$CtrlX = function (a) {
	return {ctor: 'CtrlX', _0: a};
};
var _user$project$Scenario$CtrlC = function (a) {
	return {ctor: 'CtrlC', _0: a};
};
var _user$project$Scenario$UpdateLightLayout = function (a) {
	return {ctor: 'UpdateLightLayout', _0: a};
};
var _user$project$Scenario$UpdateLayoutFromNodeId = F2(
	function (a, b) {
		return {ctor: 'UpdateLayoutFromNodeId', _0: a, _1: b};
	});
var _user$project$Scenario$UpdateTightnessForGroup = F2(
	function (a, b) {
		return {ctor: 'UpdateTightnessForGroup', _0: a, _1: b};
	});
var _user$project$Scenario$UpdateNodeGeometryProperty = F2(
	function (a, b) {
		return {ctor: 'UpdateNodeGeometryProperty', _0: a, _1: b};
	});
var _user$project$Scenario$DeleteGeometry = function (a) {
	return {ctor: 'DeleteGeometry', _0: a};
};
var _user$project$Scenario$CreateGeometry = function (a) {
	return {ctor: 'CreateGeometry', _0: a};
};
var _user$project$Scenario$DeleteGroup = function (a) {
	return {ctor: 'DeleteGroup', _0: a};
};
var _user$project$Scenario$CreateGroup = function (a) {
	return {ctor: 'CreateGroup', _0: a};
};
var _user$project$Scenario$UpdateNodeGroupProperty = F2(
	function (a, b) {
		return {ctor: 'UpdateNodeGroupProperty', _0: a, _1: b};
	});
var _user$project$Scenario$UpdateOutpowered = {ctor: 'UpdateOutpowered'};
var _user$project$Scenario$GroupNodes = F2(
	function (a, b) {
		return {ctor: 'GroupNodes', _0: a, _1: b};
	});
var _user$project$Scenario$LoadModel = function (a) {
	return {ctor: 'LoadModel', _0: a};
};
var _user$project$Scenario$UpdateState = F2(
	function (a, b) {
		return {ctor: 'UpdateState', _0: a, _1: b};
	});
var _user$project$Scenario$UpdateNodeRoles = F3(
	function (a, b, c) {
		return {ctor: 'UpdateNodeRoles', _0: a, _1: b, _2: c};
	});
var _user$project$Scenario$UpdateAttribute = F2(
	function (a, b) {
		return {ctor: 'UpdateAttribute', _0: a, _1: b};
	});
var _user$project$Scenario$UpdateProperty = F2(
	function (a, b) {
		return {ctor: 'UpdateProperty', _0: a, _1: b};
	});
var _user$project$Scenario$DeleteParameter = function (a) {
	return {ctor: 'DeleteParameter', _0: a};
};
var _user$project$Scenario$CreateParameter = function (a) {
	return {ctor: 'CreateParameter', _0: a};
};
var _user$project$Scenario$RenameNode = F2(
	function (a, b) {
		return {ctor: 'RenameNode', _0: a, _1: b};
	});
var _user$project$Scenario$DeleteNode = function (a) {
	return {ctor: 'DeleteNode', _0: a};
};
var _user$project$Scenario$DeleteLink = function (a) {
	return {ctor: 'DeleteLink', _0: a};
};
var _user$project$Scenario$CreateLink = F2(
	function (a, b) {
		return {ctor: 'CreateLink', _0: a, _1: b};
	});
var _user$project$Scenario$CreateNode = F2(
	function (a, b) {
		return {ctor: 'CreateNode', _0: a, _1: b};
	});
var _user$project$Scenario$NoOp = {ctor: 'NoOp'};

var _user$project$SpecialKey$insert = _elm_lang$core$Set$insert;
var _user$project$SpecialKey$remove = _elm_lang$core$Set$remove;
var _user$project$SpecialKey$member = _elm_lang$core$Set$member;
var _user$project$SpecialKey$defaultModel = _elm_lang$core$Set$empty;
var _user$project$SpecialKey$shift = 16;

var _user$project$Search$mustBuildList = F2(
	function (model, b) {
		return _elm_lang$core$Native_Utils.update(
			model,
			{mustBuildList: b});
	});
var _user$project$Search$bringToBack_ = F2(
	function (n, l) {
		return _elm_lang$core$List$concat(
			{
				ctor: '::',
				_0: A2(
					_elm_lang$core$List$filter,
					function (x) {
						return !_elm_lang$core$Native_Utils.eq(x.id, n.id);
					},
					l),
				_1: {
					ctor: '::',
					_0: {
						ctor: '::',
						_0: n,
						_1: {ctor: '[]'}
					},
					_1: {ctor: '[]'}
				}
			});
	});
var _user$project$Search$bringToFront_ = F2(
	function (n, l) {
		return {
			ctor: '::',
			_0: n,
			_1: A2(
				_elm_lang$core$List$filter,
				function (x) {
					return !_elm_lang$core$Native_Utils.eq(x.id, n.id);
				},
				l)
		};
	});
var _user$project$Search$defaultModel = {
	nodes: {ctor: '[]'},
	mustBuildList: false
};
var _user$project$Search$init_ = F2(
	function (s, list) {
		return _elm_lang$core$Native_Utils.update(
			_user$project$Search$defaultModel,
			{
				nodes: A2(
					_elm_lang$core$List$filter,
					function (x) {
						return _elm_lang$core$Native_Utils.eq(x.name, s);
					},
					list)
			});
	});
var _user$project$Search$search = F3(
	function (model, s, nodes) {
		var ll = A2(_user$project$Search$init_, s, nodes);
		var _p0 = {
			ctor: '_Tuple2',
			_0: _elm_lang$core$List$head(model.nodes),
			_1: model.mustBuildList
		};
		if (_p0._0.ctor === 'Nothing') {
			return ll;
		} else {
			if (_p0._1 === true) {
				return ll;
			} else {
				return _elm_lang$core$Native_Utils.update(
					model,
					{
						nodes: A2(_user$project$Search$bringToBack_, _p0._0._0, model.nodes)
					});
			}
		}
	});
var _user$project$Search$Model = F2(
	function (a, b) {
		return {nodes: a, mustBuildList: b};
	});

var _user$project$Model$defaultTmpDataModel = {m_id: _elm_lang$core$Maybe$Nothing, data: _user$project$DataModel$defaultModel};
var _user$project$Model$TmpDataModel = F2(
	function (a, b) {
		return {m_id: a, data: b};
	});
var _user$project$Model$Model = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return function (l) {
												return function (m) {
													return function (n) {
														return function (o) {
															return function (p) {
																return function (q) {
																	return function (r) {
																		return function (s) {
																			return function (t) {
																				return function (u) {
																					return function (v) {
																						return function (w) {
																							return function (x) {
																								return {dataModel: a, subModel: b, tmpDataModel: c, input: d, inputFile: e, selection: f, loadModelId: g, viewType: h, nodeViewId: i, parameters: j, exportFlux: k, error: l, selectionType: m, undo: n, redo: o, specialKey: p, geometryId: q, selectedGeometryId: r, layoutMenu: s, showFunctionalChain: t, showGeometries: u, showParameters: v, propagationDone: w, searchModel: x};
																							};
																						};
																					};
																				};
																			};
																		};
																	};
																};
															};
														};
													};
												};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _user$project$Model$Geometry = {ctor: 'Geometry'};
var _user$project$Model$Flat = {ctor: 'Flat'};
var _user$project$Model$All = {ctor: 'All'};
var _user$project$Model$Pbs = {ctor: 'Pbs'};
var _user$project$Model$Bubble = {ctor: 'Bubble'};
var _user$project$Model$LINK = function (a) {
	return {ctor: 'LINK', _0: a};
};
var _user$project$Model$PARENT = {ctor: 'PARENT'};
var _user$project$Model$defaultModel = {
	dataModel: _user$project$DataModel$defaultModel,
	subModel: _user$project$DataModel$defaultModel,
	tmpDataModel: _user$project$Model$defaultTmpDataModel,
	input: 'undefined',
	inputFile: 'undefined',
	selection: {ctor: '[]'},
	loadModelId: 'loadModel',
	viewType: _user$project$Model$Bubble,
	nodeViewId: _elm_lang$core$Maybe$Nothing,
	parameters: _user$project$LinkParameters$defaultModel,
	exportFlux: _elm_lang$core$Set$empty,
	error: _elm_lang$core$Maybe$Nothing,
	selectionType: _user$project$Model$PARENT,
	undo: _user$project$Scenario$defaultModel,
	redo: _user$project$Scenario$defaultRedoModel,
	specialKey: _user$project$SpecialKey$defaultModel,
	geometryId: _elm_lang$core$Maybe$Nothing,
	selectedGeometryId: _elm_lang$core$Maybe$Nothing,
	layoutMenu: _user$project$LayoutMenu$defaultModel,
	showFunctionalChain: false,
	showGeometries: false,
	showParameters: false,
	propagationDone: false,
	searchModel: _user$project$Search$defaultModel
};

var _user$project$Messages$NoOp = {ctor: 'NoOp'};
var _user$project$Messages$Propagation = {ctor: 'Propagation'};
var _user$project$Messages$Verification = {ctor: 'Verification'};
var _user$project$Messages$ShowHideParameters = {ctor: 'ShowHideParameters'};
var _user$project$Messages$ShowHideGeometries = {ctor: 'ShowHideGeometries'};
var _user$project$Messages$ShowHideFunctionalChain = {ctor: 'ShowHideFunctionalChain'};
var _user$project$Messages$SwitchElemState = function (a) {
	return {ctor: 'SwitchElemState', _0: a};
};
var _user$project$Messages$SwitchElemRole = F2(
	function (a, b) {
		return {ctor: 'SwitchElemRole', _0: a, _1: b};
	});
var _user$project$Messages$SwitchToLayout = function (a) {
	return {ctor: 'SwitchToLayout', _0: a};
};
var _user$project$Messages$SendGeometryToElm = function (a) {
	return {ctor: 'SendGeometryToElm', _0: a};
};
var _user$project$Messages$LoadGeometryButton = function (a) {
	return {ctor: 'LoadGeometryButton', _0: a};
};
var _user$project$Messages$LoadGeometry = {ctor: 'LoadGeometry'};
var _user$project$Messages$HighLightGeometry = function (a) {
	return {ctor: 'HighLightGeometry', _0: a};
};
var _user$project$Messages$CheckNodeGeometryProperty = F2(
	function (a, b) {
		return {ctor: 'CheckNodeGeometryProperty', _0: a, _1: b};
	});
var _user$project$Messages$DeleteGeometry = {ctor: 'DeleteGeometry'};
var _user$project$Messages$CreateGeometry = {ctor: 'CreateGeometry'};
var _user$project$Messages$SaveToImage = {ctor: 'SaveToImage'};
var _user$project$Messages$ImportModel = {ctor: 'ImportModel'};
var _user$project$Messages$OnImport = {ctor: 'OnImport'};
var _user$project$Messages$OnOpen = {ctor: 'OnOpen'};
var _user$project$Messages$NodesPositionRequest = function (a) {
	return {ctor: 'NodesPositionRequest', _0: a};
};
var _user$project$Messages$Redo = {ctor: 'Redo'};
var _user$project$Messages$Undo = {ctor: 'Undo'};
var _user$project$Messages$GetPositions = {ctor: 'GetPositions'};
var _user$project$Messages$Layout = {ctor: 'Layout'};
var _user$project$Messages$UpdateTightness = {ctor: 'UpdateTightness'};
var _user$project$Messages$SelectedParameters = function (a) {
	return {ctor: 'SelectedParameters', _0: a};
};
var _user$project$Messages$HighLightGroup = function (a) {
	return {ctor: 'HighLightGroup', _0: a};
};
var _user$project$Messages$DeleteGroup = {ctor: 'DeleteGroup'};
var _user$project$Messages$CreateGroup = {ctor: 'CreateGroup'};
var _user$project$Messages$CheckNodeGroupProperty = F2(
	function (a, b) {
		return {ctor: 'CheckNodeGroupProperty', _0: a, _1: b};
	});
var _user$project$Messages$GroupNodes = {ctor: 'GroupNodes'};
var _user$project$Messages$UpdateAttribute = function (a) {
	return {ctor: 'UpdateAttribute', _0: a};
};
var _user$project$Messages$DeleteParameter = {ctor: 'DeleteParameter'};
var _user$project$Messages$CreateParameter = {ctor: 'CreateParameter'};
var _user$project$Messages$ExportLink = {ctor: 'ExportLink'};
var _user$project$Messages$CheckFlux = function (a) {
	return {ctor: 'CheckFlux', _0: a};
};
var _user$project$Messages$CheckProperty = F2(
	function (a, b) {
		return {ctor: 'CheckProperty', _0: a, _1: b};
	});
var _user$project$Messages$DoubleClick = function (a) {
	return {ctor: 'DoubleClick', _0: a};
};
var _user$project$Messages$KeyDowns = function (a) {
	return {ctor: 'KeyDowns', _0: a};
};
var _user$project$Messages$KeyUps = function (a) {
	return {ctor: 'KeyUps', _0: a};
};
var _user$project$Messages$SwitchToView = function (a) {
	return {ctor: 'SwitchToView', _0: a};
};
var _user$project$Messages$LoadModel = {ctor: 'LoadModel'};
var _user$project$Messages$SaveModel = {ctor: 'SaveModel'};
var _user$project$Messages$NodesPositionToElm = function (a) {
	return {ctor: 'NodesPositionToElm', _0: a};
};
var _user$project$Messages$ImportCsvModeltoElm = function (a) {
	return {ctor: 'ImportCsvModeltoElm', _0: a};
};
var _user$project$Messages$ImportModelToElm = function (a) {
	return {ctor: 'ImportModelToElm', _0: a};
};
var _user$project$Messages$Csv2ModelToElm = function (a) {
	return {ctor: 'Csv2ModelToElm', _0: a};
};
var _user$project$Messages$CsvModelToElm = function (a) {
	return {ctor: 'CsvModelToElm', _0: a};
};
var _user$project$Messages$ModelToElm = function (a) {
	return {ctor: 'ModelToElm', _0: a};
};
var _user$project$Messages$Selection = function (a) {
	return {ctor: 'Selection', _0: a};
};
var _user$project$Messages$InputFileChange = function (a) {
	return {ctor: 'InputFileChange', _0: a};
};
var _user$project$Messages$InputChange = function (a) {
	return {ctor: 'InputChange', _0: a};
};
var _user$project$Messages$CreateLink = {ctor: 'CreateLink'};
var _user$project$Messages$RenameNode = {ctor: 'RenameNode'};
var _user$project$Messages$CreateNode = {ctor: 'CreateNode'};
var _user$project$Messages$FocusResult = function (a) {
	return {ctor: 'FocusResult', _0: a};
};
var _user$project$Messages$FocusOn = function (a) {
	return {ctor: 'FocusOn', _0: a};
};

var _user$project$Csv$isValidName_ = function (s) {
	return _elm_lang$core$Native_Utils.cmp(
		_elm_lang$core$String$length(s),
		3) > -1;
};
var _user$project$Csv$isBlocInModel_ = F2(
	function (s, model) {
		return A2(_user$project$DataModel$isNamePresent, s, model.nodes);
	});
var _user$project$Csv$isValidLineForLink_ = F2(
	function (csvLine, model) {
		var b = (!_elm_lang$core$String$isEmpty(csvLine.refAboutissant1)) && ((!_elm_lang$core$String$isEmpty(csvLine.refAboutissant2)) && ((!_elm_lang$core$Native_Utils.eq(csvLine.refAboutissant2, csvLine.refAboutissant1)) && (A2(_user$project$Csv$isBlocInModel_, csvLine.refAboutissant1, model) && A2(_user$project$Csv$isBlocInModel_, csvLine.refAboutissant2, model))));
		return b;
	});
var _user$project$Csv$isValidLineForBloc_ = function (csvLine) {
	return _elm_lang$core$String$isEmpty(csvLine.refAboutissant1) && (_elm_lang$core$String$isEmpty(csvLine.refAboutissant2) && _user$project$Csv$isValidName_(csvLine.name));
};
var _user$project$Csv$addSecondBlocToModel_ = F3(
	function (m_p, s, model) {
		var _p0 = A3(_user$project$DataModel$getNodeFromNameAndParent, s, m_p, model.nodes);
		if (_p0.ctor === 'Nothing') {
			return A3(_user$project$DataModelActions$createNode, s, m_p, model);
		} else {
			return model;
		}
	});
var _user$project$Csv$addEndBlocToModel_ = F3(
	function (m_id, s, model) {
		return A3(_user$project$Csv$addSecondBlocToModel_, m_id, s, model);
	});
var _user$project$Csv$addFirstBlocToModel_ = F2(
	function (s, model) {
		var _p1 = A3(_user$project$DataModel$getNodeFromNameAndParent, s, _elm_lang$core$Maybe$Nothing, model.nodes);
		if (_p1.ctor === 'Nothing') {
			return A3(_user$project$DataModelActions$createNode, s, _elm_lang$core$Maybe$Nothing, model);
		} else {
			return model;
		}
	});
var _user$project$Csv$addLinkToModel_ = F2(
	function (csvLine, model) {
		var m_id2 = A2(_user$project$DataModel$getNodeIdFromName, csvLine.refAboutissant2, model.nodes);
		var m_id1 = A2(_user$project$DataModel$getNodeIdFromName, csvLine.refAboutissant1, model.nodes);
		var m1 = function () {
			var _p2 = {ctor: '_Tuple2', _0: m_id1, _1: m_id2};
			if (((_p2.ctor === '_Tuple2') && (_p2._0.ctor === 'Just')) && (_p2._1.ctor === 'Just')) {
				var _p7 = _p2._1._0;
				var _p6 = _p2._0._0;
				var _p3 = _elm_lang$core$Native_Utils.eq(_p6, _p7);
				if (_p3 === true) {
					return model;
				} else {
					var m2 = A3(_user$project$DataModelActions$createLink, _p6, _p7, model);
					var m3 = function () {
						var _p4 = !_elm_lang$core$String$isEmpty(csvLine.parameter);
						if (_p4 === true) {
							var m21 = A2(_user$project$DataModelActions$createParameter, csvLine.parameter, m2);
							var m_edge = A3(_user$project$DataModel$getEdgeFromNodesName, csvLine.refAboutissant1, csvLine.refAboutissant2, m21);
							var m22 = function () {
								var _p5 = m_edge;
								if (_p5.ctor === 'Just') {
									return A3(_user$project$DataModelActions$updateProperty, _p5._0, csvLine.parameter, m21);
								} else {
									return m21;
								}
							}();
							return m22;
						} else {
							return m2;
						}
					}();
					return m3;
				}
			} else {
				return model;
			}
		}();
		return m1;
	});
var _user$project$Csv$getSecondName_ = function (s) {
	return A3(_elm_lang$core$String$slice, 0, 2, s);
};
var _user$project$Csv$getFirstName_ = function (s) {
	return A3(_elm_lang$core$String$slice, 0, 1, s);
};
var _user$project$Csv$addBlocToModel_ = F2(
	function (s, model) {
		var nameBloc = s;
		var secondBloc = _user$project$Csv$getSecondName_(s);
		var firstBloc = _user$project$Csv$getFirstName_(s);
		var m1 = A2(_user$project$Csv$addFirstBlocToModel_, firstBloc, model);
		var m_id = A3(_user$project$DataModel$getNodeIdFromNameAndParent, firstBloc, _elm_lang$core$Maybe$Nothing, m1.nodes);
		var m2 = A3(_user$project$Csv$addSecondBlocToModel_, m_id, secondBloc, m1);
		var m_id2 = A3(_user$project$DataModel$getNodeIdFromNameAndParent, secondBloc, m_id, m2.nodes);
		var m3 = A3(_user$project$Csv$addEndBlocToModel_, m_id2, s, m2);
		return m3;
	});
var _user$project$Csv$addBlocFromCsvToModel_ = F2(
	function (csvLine, model) {
		var _p8 = _user$project$Csv$isValidLineForBloc_(csvLine);
		if (_p8 === false) {
			return model;
		} else {
			return A2(_user$project$Csv$addBlocToModel_, csvLine.name, model);
		}
	});
var _user$project$Csv$addLinkFromCsvLine_ = F2(
	function (csvLine, model) {
		var _p9 = A2(_user$project$Csv$isValidLineForLink_, csvLine, model);
		if (_p9 === true) {
			return A2(_user$project$Csv$addLinkToModel_, csvLine, model);
		} else {
			return model;
		}
	});
var _user$project$Csv$testAddBloc = F2(
	function (list, model) {
		testAddBloc:
		while (true) {
			var _p10 = list;
			if (_p10.ctor === '[]') {
				return model;
			} else {
				var _v9 = _p10._1,
					_v10 = A2(_user$project$Csv$addBlocToModel_, _p10._0, model);
				list = _v9;
				model = _v10;
				continue testAddBloc;
			}
		}
	});
var _user$project$Csv$testAddCsvToModel = F2(
	function (list, model) {
		var l1 = A2(
			_elm_lang$core$List$filter,
			function (x) {
				return _user$project$Csv$isValidLineForBloc_(x);
			},
			list);
		var m1 = A3(
			_elm_lang$core$List$foldr,
			function (x) {
				return _user$project$Csv$addBlocToModel_(x.name);
			},
			model,
			l1);
		var m2 = A3(
			_elm_lang$core$List$foldr,
			function (x) {
				return _user$project$Csv$addLinkFromCsvLine_(x);
			},
			m1,
			list);
		return m2;
	});
var _user$project$Csv$defaultCsvLine = {name: '', denomination: '', refAboutissant1: '', refAboutissant2: '', parameter: ''};
var _user$project$Csv$cons = function (list) {
	var _p11 = list;
	if (((((_p11.ctor === '::') && (_p11._1.ctor === '::')) && (_p11._1._1.ctor === '::')) && (_p11._1._1._1.ctor === '::')) && (_p11._1._1._1._1.ctor === '::')) {
		return _elm_lang$core$Native_Utils.update(
			_user$project$Csv$defaultCsvLine,
			{name: _p11._0, denomination: _p11._1._0, refAboutissant1: _p11._1._1._0, refAboutissant2: _p11._1._1._1._0, parameter: _p11._1._1._1._1._0});
	} else {
		return _user$project$Csv$defaultCsvLine;
	}
};
var _user$project$Csv$stringToCsvLine = function (s) {
	var list = A2(_elm_lang$core$String$split, ';', s);
	return _user$project$Csv$cons(list);
};
var _user$project$Csv$loadCsvModel = F2(
	function (s, model) {
		return A2(
			_user$project$Csv$testAddCsvToModel,
			A2(
				_elm_lang$core$List$map,
				function (x) {
					return _user$project$Csv$stringToCsvLine(x);
				},
				_elm_lang$core$String$lines(s)),
			model);
	});
var _user$project$Csv$CsvLine = F5(
	function (a, b, c, d, e) {
		return {name: a, denomination: b, refAboutissant1: c, refAboutissant2: d, parameter: e};
	});

var _user$project$PlayerDataModel$playOne = F2(
	function (msg, model) {
		var newModel = function () {
			var _p0 = msg;
			switch (_p0.ctor) {
				case 'CreateNode':
					return A3(_user$project$DataModelActions$createNode, _p0._0, _p0._1, model);
				case 'CreateLink':
					return A3(_user$project$DataModelActions$createLink, _p0._0, _p0._1, model);
				case 'DeleteLink':
					return A2(_user$project$DataModelActions$deleteEdge, _p0._0, model);
				case 'DeleteNode':
					return A2(_user$project$DataModelActions$deleteNode, _p0._0, model);
				case 'RenameNode':
					return A3(_user$project$DataModelActions$renameNode, _p0._0, _p0._1, model);
				case 'CreateParameter':
					return A2(_user$project$DataModelActions$createParameter, _p0._0, model);
				case 'DeleteParameter':
					return A2(_user$project$DataModelActions$deleteParameter, _p0._0, model);
				case 'UpdateProperty':
					return A3(_user$project$DataModelActions$updateProperty, _p0._0, _p0._1, model);
				case 'UpdateAttribute':
					return A3(_user$project$DataModelActions$updateAttribute, _p0._1, _p0._0, model);
				case 'UpdateNodeRoles':
					return A4(_user$project$DataModelActions$updateNodeRoles, _p0._2, _p0._0, _p0._1, model);
				case 'UpdateState':
					return A3(_user$project$DataModelActions$updateState, _p0._1, _p0._0, model);
				case 'LoadModel':
					return A2(_user$project$DataModel$dataModelToModel, _p0._0, model);
				case 'GroupNodes':
					return A3(_user$project$DataModelActions$groupNodes, _p0._0, _p0._1, model);
				case 'CreateGroup':
					return A2(_user$project$DataModelActions$createGroup, _p0._0, model);
				case 'DeleteGroup':
					return A2(_user$project$DataModelActions$deleteGroup, _p0._0, model);
				case 'CreateGeometry':
					return A2(_user$project$DataModelActions$createGeometry, _p0._0, model);
				case 'DeleteGeometry':
					return A2(_user$project$DataModelActions$deleteGeometry, _p0._0, model);
				case 'UpdateNodeGeometryProperty':
					return A3(_user$project$DataModelActions$updateNodeGeometryProperty, _p0._0, _p0._1, model);
				case 'UpdateNodeGroupProperty':
					return A3(_user$project$DataModelActions$updateNodeGroupProperty, _p0._0, _p0._1, model);
				case 'UpdateTightnessForGroup':
					return A3(_user$project$DataModelActions$updateTightnessForGroup, _p0._0, _p0._1, model);
				case 'UpdateLayoutFromNodeId':
					return A3(_user$project$DataModelActions$updateLayoutFromNodeId, _p0._0, _p0._1, model);
				case 'UpdateLightLayout':
					return A2(_user$project$DataModelActions$updateLightLayout, _p0._0, model);
				case 'SendGeometryName':
					return A2(_user$project$DataModelActions$sendGeometryName, _p0._0, model);
				case 'LoadCsvModel':
					return A2(_user$project$Csv$loadCsvModel, _p0._0, model);
				default:
					return model;
			}
		}();
		return newModel;
	});
var _user$project$PlayerDataModel$play = F2(
	function (list, model) {
		play:
		while (true) {
			var _p1 = list;
			if (_p1.ctor === '::') {
				var _v2 = _p1._1,
					_v3 = A2(_user$project$PlayerDataModel$playOne, _p1._0, model);
				list = _v2;
				model = _v3;
				continue play;
			} else {
				return model;
			}
		}
	});
var _user$project$PlayerDataModel$redo = F2(
	function (m_redo, model) {
		var _p2 = m_redo;
		if (_p2.ctor === 'Just') {
			return A2(_user$project$PlayerDataModel$playOne, _p2._0, model);
		} else {
			return model;
		}
	});

var _user$project$Verification$isLinkNodeWithAscendant_ = F2(
	function (edge, model) {
		var m_ntarget = A2(_user$project$DataModel$getNodeFromId, edge.target, model.nodes);
		var m_nsrc = A2(_user$project$DataModel$getNodeFromId, edge.source, model.nodes);
		var b = function () {
			var _p0 = {ctor: '_Tuple2', _0: m_nsrc, _1: m_ntarget};
			if (((_p0.ctor === '_Tuple2') && (_p0._0.ctor === 'Just')) && (_p0._1.ctor === 'Just')) {
				var _p2 = _p0._1._0;
				var _p1 = _p0._0._0;
				var target_ascendants = A3(_user$project$ModelManagement$getAscendants, model.nodes, _p2, _elm_lang$core$Maybe$Nothing);
				var src_ascendants = A3(_user$project$ModelManagement$getAscendants, model.nodes, _p1, _elm_lang$core$Maybe$Nothing);
				var b1 = A2(_elm_lang$core$List$member, _p1, target_ascendants) || A2(_elm_lang$core$List$member, _p2, src_ascendants);
				var z = _elm_lang$core$Native_Utils.eq(b1, true) ? A2(
					_elm_lang$core$Debug$log,
					'delete link',
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: _p1, _1: _p2},
						_1: {ctor: '[]'}
					}) : {ctor: '[]'};
				return b1;
			} else {
				return false;
			}
		}();
		return b;
	});
var _user$project$Verification$filterLinkNodeWithAscendant_ = function (model) {
	var filterEdges = A2(
		_elm_lang$core$List$filter,
		function (x) {
			return !A2(_user$project$Verification$isLinkNodeWithAscendant_, x, model);
		},
		model.edges);
	return _elm_lang$core$Native_Utils.update(
		model,
		{edges: filterEdges});
};
var _user$project$Verification$mk_ = F3(
	function (maxId, i, l) {
		mk_:
		while (true) {
			var _p3 = _elm_lang$core$Native_Utils.cmp(i, maxId) > 0;
			if (_p3 === true) {
				return l;
			} else {
				var _v2 = maxId,
					_v3 = i + 1,
					_v4 = {ctor: '::', _0: i, _1: l};
				maxId = _v2;
				i = _v3;
				l = _v4;
				continue mk_;
			}
		}
	});
var _user$project$Verification$mkListId = function (maxId) {
	var list = A3(
		_user$project$Verification$mk_,
		maxId,
		0,
		{ctor: '[]'});
	var z = A2(
		_elm_lang$core$Debug$log,
		'mkListId ',
		{ctor: '_Tuple2', _0: maxId, _1: list});
	return list;
};
var _user$project$Verification$unicityBlocId_ = F2(
	function (id, model) {
		var list = A2(
			_elm_lang$core$List$filter,
			function (x) {
				return _elm_lang$core$Native_Utils.eq(x.id, id);
			},
			model.nodes);
		var msg = function () {
			var _p4 = _elm_lang$core$Native_Utils.cmp(
				_elm_lang$core$List$length(list),
				1) > 0;
			if (_p4 === true) {
				return A2(
					_elm_lang$core$Basics_ops['++'],
					'Error doublons pour id ',
					_elm_lang$core$Basics$toString(id));
			} else {
				return '';
			}
		}();
		var z = function () {
			var _p5 = _elm_lang$core$String$isEmpty(msg);
			if (_p5 === true) {
				return '';
			} else {
				return A2(_elm_lang$core$Debug$log, 'unicityBlocId_ ', msg);
			}
		}();
		return model;
	});
var _user$project$Verification$unicityBlocListId_ = F2(
	function (list, model) {
		unicityBlocListId_:
		while (true) {
			var _p6 = list;
			if (_p6.ctor === '[]') {
				return model;
			} else {
				var _v8 = _p6._1,
					_v9 = A2(_user$project$Verification$unicityBlocId_, _p6._0, model);
				list = _v8;
				model = _v9;
				continue unicityBlocListId_;
			}
		}
	});
var _user$project$Verification$verifUnicityIdBloc_ = function (model) {
	var maxId = _user$project$DataModel$getCurIdFromModel(model);
	var z = A2(_elm_lang$core$Debug$log, 'getCurIdFromModel', maxId);
	var list = _user$project$Verification$mkListId(maxId);
	var m1 = A2(_user$project$Verification$unicityBlocListId_, list, model);
	return m1;
};
var _user$project$Verification$verificationBlocs = function (model) {
	return _user$project$Verification$verifUnicityIdBloc_(model);
};
var _user$project$Verification$verification = function (model) {
	return _user$project$Verification$filterLinkNodeWithAscendant_(model);
};

var _user$project$Player$doCtrlV = F2(
	function (m_s, model) {
		var m_id = model.tmpDataModel.m_id;
		var newDataModel = A4(_user$project$DataModelActions$insertFromTmp, m_s, m_id, model.tmpDataModel.data, model.dataModel);
		var dm1 = _user$project$Verification$verification(newDataModel);
		return _elm_lang$core$Native_Utils.update(
			model,
			{dataModel: dm1});
	});
var _user$project$Player$saveNodeToTmp_ = F2(
	function (id, model) {
		var m_n = A2(_user$project$DataModel$getNodeFromId, id, model.dataModel.nodes);
		var m1 = function () {
			var _p0 = m_n;
			if (_p0.ctor === 'Nothing') {
				return model;
			} else {
				var defModel = _user$project$DataModel$defaultModel;
				var newNodes = A2(_user$project$ModelManagement$getDescendantsFromN, model.dataModel.nodes, _p0._0);
				var newEdges = A2(
					_elm_lang$core$List$filter,
					function (x) {
						return A2(_user$project$DataModel$isNodeIdPresent, x.source, newNodes) || A2(_user$project$DataModel$isNodeIdPresent, x.target, newNodes);
					},
					model.dataModel.edges);
				var newData = _elm_lang$core$Native_Utils.update(
					defModel,
					{nodes: newNodes, edges: newEdges});
				var newTmpModel = {
					m_id: _elm_lang$core$Maybe$Just(id),
					data: newData
				};
				return _elm_lang$core$Native_Utils.update(
					model,
					{tmpDataModel: newTmpModel});
			}
		}();
		return m1;
	});
var _user$project$Player$doCtrlX = F2(
	function (id, model) {
		var m1 = A2(_user$project$Player$saveNodeToTmp_, id, model);
		var newDataModel = A2(_user$project$DataModelActions$deleteNode, id, m1.dataModel);
		return _elm_lang$core$Native_Utils.update(
			m1,
			{dataModel: newDataModel});
	});
var _user$project$Player$doCtrlC = F2(
	function (id, model) {
		return A2(_user$project$Player$saveNodeToTmp_, id, model);
	});
var _user$project$Player$isDataMsg = function (msg) {
	var _p1 = msg;
	switch (_p1.ctor) {
		case 'CtrlC':
			return true;
		case 'CtrlV':
			return true;
		case 'CtrlX':
			return true;
		default:
			return false;
	}
};
var _user$project$Player$playOne = F2(
	function (msg, model) {
		var newModel = function () {
			var _p2 = _user$project$Player$isDataMsg(msg);
			if (_p2 === false) {
				var newDataModel = A2(_user$project$PlayerDataModel$playOne, msg, model.dataModel);
				return _elm_lang$core$Native_Utils.update(
					model,
					{dataModel: newDataModel});
			} else {
				var _p3 = msg;
				switch (_p3.ctor) {
					case 'CtrlC':
						return A2(_user$project$Player$doCtrlC, _p3._0, model);
					case 'CtrlX':
						return A2(_user$project$Player$doCtrlX, _p3._0, model);
					case 'CtrlV':
						return A2(_user$project$Player$doCtrlV, _p3._0, model);
					default:
						return model;
				}
			}
		}();
		return newModel;
	});
var _user$project$Player$play = F2(
	function (list, model) {
		play:
		while (true) {
			var _p4 = list;
			if (_p4.ctor === '::') {
				var _v5 = _p4._1,
					_v6 = A2(_user$project$Player$playOne, _p4._0, model);
				list = _v5;
				model = _v6;
				continue play;
			} else {
				return model;
			}
		}
	});
var _user$project$Player$redo = F2(
	function (m_redo, model) {
		var _p5 = m_redo;
		if (_p5.ctor === 'Just') {
			return A2(_user$project$Player$playOne, _p5._0, model);
		} else {
			return model;
		}
	});

var _user$project$Csv2$addSecondBlocToModel_ = F4(
	function (m_p, s, attribute, model) {
		var _p0 = A2(_user$project$DataModel$getNodeFromName, s, model.nodes);
		if (_p0.ctor === 'Nothing') {
			var m1 = A3(_user$project$DataModelActions$createNode, s, m_p, model);
			var m_id = A3(_user$project$DataModel$getNodeIdFromNameAndParent, s, m_p, m1.nodes);
			var m2 = A3(_user$project$DataModelActions$updateAttribute, m_id, attribute, m1);
			return m2;
		} else {
			var newNodes = A2(
				_elm_lang$core$List$map,
				function (x) {
					var _p1 = _elm_lang$core$Native_Utils.eq(x, _p0._0);
					if (_p1 === true) {
						return _elm_lang$core$Native_Utils.update(
							x,
							{parent: m_p});
					} else {
						return x;
					}
				},
				model.nodes);
			return _elm_lang$core$Native_Utils.update(
				model,
				{nodes: newNodes});
		}
	});
var _user$project$Csv2$addBlocToModel_ = F2(
	function (x, model) {
		var attribute = x.denomination;
		var sparent = x.parent;
		var _p2 = A2(_elm_lang$core$Debug$log, 'addBlocToModel_ parent ', sparent);
		var name = x.name;
		var _p3 = _elm_lang$core$String$isEmpty(sparent);
		if (_p3 === true) {
			return A4(_user$project$Csv2$addSecondBlocToModel_, _elm_lang$core$Maybe$Nothing, name, attribute, model);
		} else {
			var _p4 = A2(_user$project$DataModel$isNamePresent, sparent, model.nodes);
			if (_p4 === true) {
				var m_p = A2(_user$project$DataModel$getNodeIdFromName, sparent, model.nodes);
				var m = A4(_user$project$Csv2$addSecondBlocToModel_, m_p, name, attribute, model);
				return m;
			} else {
				var m1 = A3(_user$project$DataModelActions$createNode, sparent, _elm_lang$core$Maybe$Nothing, model);
				var m_p = A2(_user$project$DataModel$getNodeIdFromName, sparent, m1.nodes);
				var m = A4(_user$project$Csv2$addSecondBlocToModel_, m_p, name, attribute, m1);
				return m;
			}
		}
	});
var _user$project$Csv2$addLinkToModel_ = F2(
	function (csvLine, model) {
		var m_id2 = A2(_user$project$DataModel$getNodeIdFromName, csvLine.refAboutissant2, model.nodes);
		var m_id1 = A2(_user$project$DataModel$getNodeIdFromName, csvLine.refAboutissant1, model.nodes);
		var m1 = function () {
			var _p5 = {ctor: '_Tuple2', _0: m_id1, _1: m_id2};
			if (((_p5.ctor === '_Tuple2') && (_p5._0.ctor === 'Just')) && (_p5._1.ctor === 'Just')) {
				var _p11 = _p5._1._0;
				var _p10 = _p5._0._0;
				var _p6 = _elm_lang$core$Native_Utils.eq(_p10, _p11);
				if (_p6 === true) {
					return model;
				} else {
					var m2 = A3(_user$project$DataModelActions$createLink, _p10, _p11, model);
					var m3 = function () {
						var _p7 = !_elm_lang$core$String$isEmpty(csvLine.parameter);
						if (_p7 === true) {
							var m21 = A2(_user$project$DataModelActions$createParameter, csvLine.parameter, m2);
							var m_edge = A3(_user$project$DataModel$getEdgeFromNodesName, csvLine.refAboutissant1, csvLine.refAboutissant2, m21);
							var m22 = function () {
								var _p8 = m_edge;
								if (_p8.ctor === 'Just') {
									return A3(_user$project$DataModelActions$updateProperty, _p8._0, csvLine.parameter, m21);
								} else {
									return m21;
								}
							}();
							return m22;
						} else {
							return m2;
						}
					}();
					var m4 = function () {
						var m_edge = A3(_user$project$DataModel$getEdgeFromNodesName, csvLine.refAboutissant1, csvLine.refAboutissant2, m3);
						var m_id = function () {
							var _p9 = m_edge;
							if (_p9.ctor === 'Just') {
								return _elm_lang$core$Maybe$Just(_p9._0.id);
							} else {
								return _elm_lang$core$Maybe$Nothing;
							}
						}();
						return A3(_user$project$DataModelActions$updateAttribute, m_id, csvLine.denomination, m3);
					}();
					return m4;
				}
			} else {
				return model;
			}
		}();
		return m1;
	});
var _user$project$Csv2$isValidName_ = function (s) {
	return _elm_lang$core$Native_Utils.cmp(
		_elm_lang$core$String$length(s),
		1) > -1;
};
var _user$project$Csv2$isBlocInModel_ = F2(
	function (s, model) {
		return A2(_user$project$DataModel$isNamePresent, s, model.nodes);
	});
var _user$project$Csv2$isValidLineForLink_ = F2(
	function (csvLine, model) {
		var b = (!_elm_lang$core$String$isEmpty(csvLine.refAboutissant1)) && ((!_elm_lang$core$String$isEmpty(csvLine.refAboutissant2)) && ((!_elm_lang$core$Native_Utils.eq(csvLine.refAboutissant2, csvLine.refAboutissant1)) && (A2(_user$project$Csv2$isBlocInModel_, csvLine.refAboutissant1, model) && A2(_user$project$Csv2$isBlocInModel_, csvLine.refAboutissant2, model))));
		return b;
	});
var _user$project$Csv2$addLinkFromCsvLine_ = F2(
	function (csvLine, model) {
		var _p12 = A2(_user$project$Csv2$isValidLineForLink_, csvLine, model);
		if (_p12 === true) {
			return A2(_user$project$Csv2$addLinkToModel_, csvLine, model);
		} else {
			return model;
		}
	});
var _user$project$Csv2$isValidLineForBloc_ = function (csvLine) {
	return _elm_lang$core$String$isEmpty(csvLine.refAboutissant1) && (_elm_lang$core$String$isEmpty(csvLine.refAboutissant2) && _user$project$Csv2$isValidName_(csvLine.name));
};
var _user$project$Csv2$testAddCsvToModel = F2(
	function (list, model) {
		var l1 = A2(
			_elm_lang$core$List$filter,
			function (x) {
				return _user$project$Csv2$isValidLineForBloc_(x);
			},
			list);
		var m1 = A3(
			_elm_lang$core$List$foldr,
			function (x) {
				return _user$project$Csv2$addBlocToModel_(x);
			},
			model,
			l1);
		var m2 = A3(
			_elm_lang$core$List$foldr,
			function (x) {
				return _user$project$Csv2$addLinkFromCsvLine_(x);
			},
			m1,
			list);
		return m2;
	});
var _user$project$Csv2$supprFirstLine = function (list) {
	var _p13 = list;
	if (_p13.ctor === '[]') {
		return {ctor: '[]'};
	} else {
		return _p13._1;
	}
};
var _user$project$Csv2$defaultCsvLine = {name: '', denomination: '', parent: '', refAboutissant1: '', refAboutissant2: '', parameter: ''};
var _user$project$Csv2$cons = function (list) {
	var _p14 = list;
	if ((((((_p14.ctor === '::') && (_p14._1.ctor === '::')) && (_p14._1._1.ctor === '::')) && (_p14._1._1._1.ctor === '::')) && (_p14._1._1._1._1.ctor === '::')) && (_p14._1._1._1._1._1.ctor === '::')) {
		return _elm_lang$core$Native_Utils.update(
			_user$project$Csv2$defaultCsvLine,
			{name: _p14._0, denomination: _p14._1._0, parent: _p14._1._1._0, refAboutissant1: _p14._1._1._1._0, refAboutissant2: _p14._1._1._1._1._0, parameter: _p14._1._1._1._1._1._0});
	} else {
		return _user$project$Csv2$defaultCsvLine;
	}
};
var _user$project$Csv2$stringToCsvLine = function (s) {
	var list = A2(_elm_lang$core$String$split, ';', s);
	return _user$project$Csv2$cons(list);
};
var _user$project$Csv2$loadCsvModel = F2(
	function (s, model) {
		var lines = _user$project$Csv2$supprFirstLine(
			_elm_lang$core$String$lines(s));
		return A2(
			_user$project$Csv2$testAddCsvToModel,
			A2(
				_elm_lang$core$List$map,
				function (x) {
					return _user$project$Csv2$stringToCsvLine(x);
				},
				lines),
			model);
	});
var _user$project$Csv2$CsvLine = F6(
	function (a, b, c, d, e, f) {
		return {name: a, denomination: b, parent: c, refAboutissant1: d, refAboutissant2: e, parameter: f};
	});

var _user$project$ModelActions$blow = function (model) {
	var m_s = _user$project$Selection$getFirstSelectionIdentifier(model.selection);
	var newDataModel = function () {
		var _p0 = m_s;
		if (_p0.ctor === 'Just') {
			return A2(_user$project$DataModelActions$blow, _p0._0, model.dataModel);
		} else {
			return model.dataModel;
		}
	}();
	return _elm_lang$core$Native_Utils.update(
		model,
		{dataModel: newDataModel});
};
var _user$project$ModelActions$loadCsv2Model = F2(
	function (s, model) {
		var newUndo = A2(
			_user$project$Scenario$addMsg,
			_user$project$Scenario$LoadCsv2Model(s),
			model.undo);
		var newDataModel = A2(_user$project$Csv2$loadCsvModel, s, _user$project$DataModel$defaultModel);
		return _elm_lang$core$Native_Utils.update(
			model,
			{dataModel: newDataModel, undo: newUndo});
	});
var _user$project$ModelActions$loadCsvModel = F2(
	function (s, model) {
		var newUndo = A2(
			_user$project$Scenario$addMsg,
			_user$project$Scenario$LoadCsvModel(s),
			model.undo);
		var newDataModel = A2(_user$project$Csv$loadCsvModel, s, _user$project$DataModel$defaultModel);
		return _elm_lang$core$Native_Utils.update(
			model,
			{dataModel: newDataModel, undo: newUndo});
	});
var _user$project$ModelActions$sendGeometryName = F2(
	function (s, model) {
		var res_elts = A2(_elm_lang$core$Json_Decode$decodeString, _user$project$DataModelDecoders$decodeGeometryProperty, s);
		var m1 = function () {
			var _p1 = res_elts;
			if (_p1.ctor === 'Ok') {
				var _p2 = _p1._0;
				var newUndo = A2(
					_user$project$Scenario$addMsg,
					_user$project$Scenario$SendGeometryName(_p2),
					model.undo);
				var newDataModel = A2(_user$project$DataModelActions$sendGeometryName, _p2, model.dataModel);
				return _elm_lang$core$Native_Utils.update(
					model,
					{dataModel: newDataModel, undo: newUndo});
			} else {
				return model;
			}
		}();
		return m1;
	});
var _user$project$ModelActions$dataImportCsvModelToModel = F2(
	function (s, model) {
		var newDataModel0 = A2(_user$project$Csv$loadCsvModel, s, model.dataModel);
		var newDataModel = _user$project$DataModel$getNodeIdentifier(newDataModel0);
		var newId = newDataModel.curNodeId;
		return _elm_lang$core$Native_Utils.update(
			model,
			{
				tmpDataModel: {
					m_id: _elm_lang$core$Maybe$Just(newId),
					data: newDataModel
				}
			});
	});
var _user$project$ModelActions$dataImportModelToModel = F2(
	function (s, model) {
		var res_elts = A2(_elm_lang$core$Json_Decode$decodeString, _user$project$DataModelDecoders$decodeDataModel, s);
		var m1 = function () {
			var _p3 = res_elts;
			if (_p3.ctor === 'Ok') {
				var newDataModel0 = A2(_user$project$DataModel$dataModelToModel, _p3._0, model.dataModel);
				var newDataModel = _user$project$DataModel$getNodeIdentifier(newDataModel0);
				var newId = newDataModel.curNodeId;
				return _elm_lang$core$Native_Utils.update(
					model,
					{
						tmpDataModel: {
							m_id: _elm_lang$core$Maybe$Just(newId),
							data: newDataModel
						}
					});
			} else {
				return model;
			}
		}();
		return m1;
	});
var _user$project$ModelActions$ctrlV = function (model) {
	var b = A2(_user$project$SpecialKey$member, 17, model.specialKey);
	var m_s = _user$project$Selection$getFirstSelectionIdentifier(model.selection);
	var m1 = function () {
		var _p4 = b;
		if (_p4 === true) {
			var newUndo = A2(
				_user$project$Scenario$addMsg,
				_user$project$Scenario$CtrlV(m_s),
				model.undo);
			var newModel = A2(_user$project$Player$doCtrlV, m_s, model);
			return _elm_lang$core$Native_Utils.update(
				newModel,
				{undo: newUndo});
		} else {
			return model;
		}
	}();
	return m1;
};
var _user$project$ModelActions$ctrlX = function (model) {
	var b = A2(_user$project$SpecialKey$member, 17, model.specialKey);
	var m_s = _user$project$Selection$getFirstSelectionIdentifier(model.selection);
	var m1 = function () {
		var _p5 = {ctor: '_Tuple2', _0: m_s, _1: b};
		if (((_p5.ctor === '_Tuple2') && (_p5._0.ctor === 'Just')) && (_p5._1 === true)) {
			var _p6 = _p5._0._0;
			var newUndo = A2(
				_user$project$Scenario$addMsg,
				_user$project$Scenario$CtrlX(_p6),
				model.undo);
			var newModel = A2(_user$project$Player$doCtrlX, _p6, model);
			return _elm_lang$core$Native_Utils.update(
				newModel,
				{undo: newUndo});
		} else {
			return model;
		}
	}();
	return m1;
};
var _user$project$ModelActions$ctrlC = function (model) {
	var b = A2(_user$project$SpecialKey$member, 17, model.specialKey);
	var m_s = _user$project$Selection$getFirstSelectionIdentifier(model.selection);
	var m1 = function () {
		var _p7 = {ctor: '_Tuple2', _0: m_s, _1: b};
		if (((_p7.ctor === '_Tuple2') && (_p7._0.ctor === 'Just')) && (_p7._1 === true)) {
			var _p8 = _p7._0._0;
			var newUndo = A2(
				_user$project$Scenario$addMsg,
				_user$project$Scenario$CtrlC(_p8),
				model.undo);
			var newModel = A2(_user$project$Player$doCtrlC, _p8, model);
			return _elm_lang$core$Native_Utils.update(
				newModel,
				{undo: newUndo});
		} else {
			return model;
		}
	}();
	return m1;
};
var _user$project$ModelActions$removeMask = function (model) {
	var m_s = _user$project$Selection$getFirstSelectionIdentifier(model.selection);
	var m1 = function () {
		var _p9 = m_s;
		if (_p9.ctor === 'Nothing') {
			return model;
		} else {
			var newDataModel = A2(_user$project$DataModelActions$removeMask, _p9._0, model.dataModel);
			return _elm_lang$core$Native_Utils.update(
				model,
				{dataModel: newDataModel});
		}
	}();
	return m1;
};
var _user$project$ModelActions$insertMask = function (model) {
	var m_s = _user$project$Selection$getFirstSelectionIdentifier(model.selection);
	var m1 = function () {
		var _p10 = m_s;
		if (_p10.ctor === 'Nothing') {
			return model;
		} else {
			var newDataModel = A2(_user$project$DataModelActions$insertMask, _p10._0, model.dataModel);
			return _elm_lang$core$Native_Utils.update(
				model,
				{dataModel: newDataModel});
		}
	}();
	return m1;
};
var _user$project$ModelActions$mask = function (model) {
	var m_s = _user$project$Selection$getFirstSelectionIdentifier(model.selection);
	var m1 = function () {
		var _p11 = m_s;
		if (_p11.ctor === 'Nothing') {
			return model;
		} else {
			var _p12 = A2(_user$project$DataModelActions$isMasked, _p11._0, model.dataModel);
			if (_p12 === true) {
				return _user$project$ModelActions$removeMask(model);
			} else {
				return _user$project$ModelActions$insertMask(model);
			}
		}
	}();
	return m1;
};
var _user$project$ModelActions$removeKey = F2(
	function (k, model) {
		var newSpecialKey = A2(_user$project$SpecialKey$remove, k, model.specialKey);
		return _elm_lang$core$Native_Utils.update(
			model,
			{specialKey: newSpecialKey});
	});
var _user$project$ModelActions$insertKey = F2(
	function (k, model) {
		var newSpecialKey = A2(_user$project$SpecialKey$insert, k, model.specialKey);
		return _elm_lang$core$Native_Utils.update(
			model,
			{specialKey: newSpecialKey});
	});
var _user$project$ModelActions$searchElement = function (model) {
	var newSearchModel = A3(_user$project$Search$search, model.searchModel, model.input, model.dataModel.nodes);
	var m1 = function () {
		var _p13 = _elm_lang$core$List$head(newSearchModel.nodes);
		if (_p13.ctor === 'Nothing') {
			return _elm_lang$core$Native_Utils.update(
				model,
				{
					nodeViewId: _elm_lang$core$Maybe$Nothing,
					selection: {ctor: '[]'},
					searchModel: newSearchModel
				});
		} else {
			var _p14 = _p13._0;
			return _elm_lang$core$Native_Utils.update(
				model,
				{
					nodeViewId: _elm_lang$core$Maybe$Just(_p14.id),
					selection: {
						ctor: '::',
						_0: _p14.id,
						_1: {ctor: '[]'}
					},
					searchModel: newSearchModel
				});
		}
	}();
	return m1;
};
var _user$project$ModelActions$getAscendantName = function (model) {
	var s = function () {
		var _p15 = model.nodeViewId;
		if (_p15.ctor === 'Nothing') {
			return 'Root';
		} else {
			var m_n = A2(_user$project$DataModel$getNodeFromId, _p15._0, model.dataModel.nodes);
			var s2 = function () {
				var _p16 = m_n;
				if (_p16.ctor === 'Nothing') {
					return 'Nothing';
				} else {
					return A2(_user$project$DataModelActions$getAscendantName, _p16._0, model.dataModel);
				}
			}();
			return s2;
		}
	}();
	return s;
};
var _user$project$ModelActions$getCounterViewLabel = function (model) {
	return A2(
		_elm_lang$core$Basics_ops['++'],
		'Blocks ',
		A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Basics$toString(
				_elm_lang$core$List$length(model.dataModel.nodes)),
			A2(
				_elm_lang$core$Basics_ops['++'],
				' / Links ',
				_elm_lang$core$Basics$toString(
					_elm_lang$core$List$length(model.dataModel.edges)))));
};
var _user$project$ModelActions$getNodeViewLabel = function (model) {
	var sId = function () {
		var _p17 = model.nodeViewId;
		if (_p17.ctor === 'Nothing') {
			return ' ( )';
		} else {
			return A2(
				_elm_lang$core$Basics_ops['++'],
				' ( id = ',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(_p17._0),
					' )'));
		}
	}();
	var s = _user$project$ModelActions$getAscendantName(model);
	return A2(_elm_lang$core$Basics_ops['++'], s, sId);
};
var _user$project$ModelActions$triNodes = function (model) {
	var newDataModel = _user$project$DataModel$triNodes(model.dataModel);
	return _elm_lang$core$Native_Utils.update(
		model,
		{dataModel: newDataModel});
};
var _user$project$ModelActions$updateLightLayout = F2(
	function (s, model) {
		var res_elts = A2(_elm_lang$core$Json_Decode$decodeString, _user$project$DataModelDecoders$decodeNodesPosition, s);
		var newModel = function () {
			var _p18 = res_elts;
			if (_p18.ctor === 'Ok') {
				var _p19 = _p18._0;
				var newUndo = A2(
					_user$project$Scenario$addMsg,
					_user$project$Scenario$UpdateLightLayout(_p19),
					model.undo);
				var newDataModel = A2(_user$project$DataModelActions$updateLightLayout, _p19, model.dataModel);
				return _elm_lang$core$Native_Utils.update(
					model,
					{dataModel: newDataModel, undo: newUndo});
			} else {
				return model;
			}
		}();
		return newModel;
	});
var _user$project$ModelActions$updateGeometryLayout = F2(
	function (s, model) {
		var res_elts = A2(_elm_lang$core$Json_Decode$decodeString, _user$project$DataModelDecoders$decodeNodesPosition, s);
		var newModel = function () {
			var _p20 = res_elts;
			if (_p20.ctor === 'Ok') {
				var newDataModel = A3(_user$project$DataModelActions$updateGeometryLayoutFromId, model.geometryId, _p20._0, model.dataModel);
				return _elm_lang$core$Native_Utils.update(
					model,
					{dataModel: newDataModel});
			} else {
				return model;
			}
		}();
		return newModel;
	});
var _user$project$ModelActions$updateLayoutFromNodeId = F2(
	function (s, model) {
		var res_elts = A2(_elm_lang$core$Json_Decode$decodeString, _user$project$DataModelDecoders$decodeNodesPosition, s);
		var newModel = function () {
			var _p21 = res_elts;
			if (_p21.ctor === 'Ok') {
				var _p22 = _p21._0;
				var newUndo = A2(
					_user$project$Scenario$addMsg,
					A2(_user$project$Scenario$UpdateLayoutFromNodeId, model.nodeViewId, _p22),
					model.undo);
				var newDataModel = A3(_user$project$DataModelActions$updateLayoutFromNodeId, model.nodeViewId, _p22, model.dataModel);
				return _elm_lang$core$Native_Utils.update(
					model,
					{dataModel: newDataModel, undo: newUndo});
			} else {
				return model;
			}
		}();
		return newModel;
	});
var _user$project$ModelActions$updateTightness = function (model) {
	var newModel = function () {
		var _p23 = model.selection;
		if (_p23.ctor === '::') {
			var _p24 = _p23._0;
			var newUndo = A2(
				_user$project$Scenario$addMsg,
				A2(_user$project$Scenario$UpdateTightnessForGroup, model.input, _p24),
				model.undo);
			var newDataModel = A3(_user$project$DataModelActions$updateTightnessForGroup, model.input, _p24, model.dataModel);
			return _elm_lang$core$Native_Utils.update(
				model,
				{dataModel: newDataModel, undo: newUndo});
		} else {
			return model;
		}
	}();
	return newModel;
};
var _user$project$ModelActions$updateBullNodesPosition = function (model) {
	var m_l = function () {
		var _p25 = model.nodeViewId;
		if (_p25.ctor === 'Nothing') {
			return model.dataModel.rootBubbleLayout;
		} else {
			return A2(_user$project$DataModel$getLayoutFromNodeId, _p25._0, model.dataModel);
		}
	}();
	var newModel = function () {
		var _p26 = m_l;
		if (_p26.ctor === 'Nothing') {
			return model;
		} else {
			var newDataModel = A2(_user$project$DataModelActions$updateNodesPosition, _p26._0, model.dataModel);
			return _elm_lang$core$Native_Utils.update(
				model,
				{dataModel: newDataModel});
		}
	}();
	return newModel;
};
var _user$project$ModelActions$updateGeometryNodesPosition = function (model) {
	var m_l = function () {
		var _p27 = model.geometryId;
		if (_p27.ctor === 'Nothing') {
			return _elm_lang$core$Maybe$Nothing;
		} else {
			return A2(_user$project$DataModel$getGeometryLayoutFromId, _p27._0, model.dataModel);
		}
	}();
	var newModel = function () {
		var _p28 = m_l;
		if (_p28.ctor === 'Nothing') {
			return model;
		} else {
			var newDataModel = A2(_user$project$DataModelActions$updateNodesPosition, _p28._0, model.dataModel);
			return _elm_lang$core$Native_Utils.update(
				model,
				{dataModel: newDataModel});
		}
	}();
	return newModel;
};
var _user$project$ModelActions$updateLightNodesPosition = function (model) {
	var m_lay = model.dataModel.lightLayout;
	var newModel = function () {
		var _p29 = m_lay;
		if (_p29.ctor === 'Nothing') {
			return model;
		} else {
			var newDataModel = A2(_user$project$DataModelActions$updateNodesPosition, _p29._0, model.dataModel);
			return _elm_lang$core$Native_Utils.update(
				model,
				{dataModel: newDataModel});
		}
	}();
	return newModel;
};
var _user$project$ModelActions$updateNodesPosition = function (model) {
	var _p30 = model.viewType;
	switch (_p30.ctor) {
		case 'All':
			return _user$project$ModelActions$updateLightNodesPosition(model);
		case 'Flat':
			return _user$project$ModelActions$updateLightNodesPosition(model);
		case 'Bubble':
			return _user$project$ModelActions$updateBullNodesPosition(model);
		case 'Geometry':
			return _user$project$ModelActions$updateGeometryNodesPosition(model);
		default:
			return model;
	}
};
var _user$project$ModelActions$selectedParameters = F2(
	function (s, model) {
		var newDataModel = A2(_user$project$DataModelActions$selectedParameters, s, model.dataModel);
		return _elm_lang$core$Native_Utils.update(
			model,
			{dataModel: newDataModel});
	});
var _user$project$ModelActions$highLightGeometry = F2(
	function (s, model) {
		var m_id = A2(_user$project$Geometries$getPropertyIdFromName, s, model.dataModel.geometries);
		var m1 = _elm_lang$core$Native_Utils.update(
			model,
			{
				geometryId: function () {
					var _p31 = m_id;
					if (_p31.ctor === 'Nothing') {
						return _elm_lang$core$Maybe$Nothing;
					} else {
						var _p32 = _elm_lang$core$Native_Utils.eq(model.geometryId, m_id);
						if (_p32 === true) {
							return _elm_lang$core$Maybe$Nothing;
						} else {
							return m_id;
						}
					}
				}()
			});
		return m1;
	});
var _user$project$ModelActions$highLightGroup = F2(
	function (s, model) {
		var newDataModel = A2(_user$project$DataModelActions$highLightGroup, s, model.dataModel);
		return _elm_lang$core$Native_Utils.update(
			model,
			{dataModel: newDataModel});
	});
var _user$project$ModelActions$updateNodeGroupProperty = F3(
	function (n, s, model) {
		var newUndo = A2(
			_user$project$Scenario$addMsg,
			A2(_user$project$Scenario$UpdateNodeGroupProperty, n, s),
			model.undo);
		var newDataModel = A3(_user$project$DataModelActions$updateNodeGroupProperty, n, s, model.dataModel);
		return _elm_lang$core$Native_Utils.update(
			model,
			{dataModel: newDataModel, undo: newUndo});
	});
var _user$project$ModelActions$nodesInSelection = function (model) {
	return A2(
		_elm_lang$core$List$filter,
		function (x) {
			return A2(_user$project$DataModel$isIdPresentInList, x.id, model.selection);
		},
		model.dataModel.nodes);
};
var _user$project$ModelActions$groupNodes = function (model) {
	var s = model.input;
	var list = _user$project$ModelActions$nodesInSelection(model);
	var newDataModel = A3(_user$project$DataModelActions$groupNodes, list, s, model.dataModel);
	var newUndo = A2(
		_user$project$Scenario$addMsg,
		A2(_user$project$Scenario$GroupNodes, list, s),
		model.undo);
	return _elm_lang$core$Native_Utils.update(
		model,
		{dataModel: newDataModel, undo: newUndo});
};
var _user$project$ModelActions$redo = function (model) {
	var newUndo = function () {
		var _p33 = model.redo;
		if (_p33.ctor === 'Just') {
			return A2(_user$project$Scenario$addMsg, _p33._0, model.undo);
		} else {
			return model.undo;
		}
	}();
	var newModel = A2(_user$project$Player$redo, model.redo, model);
	return _elm_lang$core$Native_Utils.update(
		newModel,
		{redo: _elm_lang$core$Maybe$Nothing, undo: newUndo});
};
var _user$project$ModelActions$undo = function (model) {
	var _p34 = function () {
		var _p35 = model.undo;
		if (_p35.ctor === '::') {
			var _p36 = _p35._1;
			return {
				ctor: '_Tuple3',
				_0: A2(
					_user$project$Player$play,
					_elm_lang$core$List$reverse(_p36),
					_user$project$Model$defaultModel),
				_1: _p36,
				_2: _elm_lang$core$Maybe$Just(_p35._0)
			};
		} else {
			return {
				ctor: '_Tuple3',
				_0: model,
				_1: {ctor: '[]'},
				_2: _elm_lang$core$Maybe$Nothing
			};
		}
	}();
	var newModel = _p34._0;
	var newUndo = _p34._1;
	var r = _p34._2;
	var m1 = _elm_lang$core$Native_Utils.update(
		newModel,
		{undo: newUndo, redo: r});
	return m1;
};
var _user$project$ModelActions$dataModelToModel = F2(
	function (s, model) {
		var res_elts = A2(_elm_lang$core$Json_Decode$decodeString, _user$project$DataModelDecoders$decodeDataModel, s);
		var m1 = function () {
			var _p37 = res_elts;
			if (_p37.ctor === 'Ok') {
				var _p38 = _p37._0;
				var newUndo = A2(
					_user$project$Scenario$addMsg,
					_user$project$Scenario$LoadModel(_p38),
					model.undo);
				var newDataModel = A2(_user$project$DataModel$dataModelToModel, _p38, model.dataModel);
				return _elm_lang$core$Native_Utils.update(
					model,
					{dataModel: newDataModel, undo: newUndo});
			} else {
				return model;
			}
		}();
		return m1;
	});
var _user$project$ModelActions$updateProperty = F3(
	function (edge, s, model) {
		var newUndo = A2(
			_user$project$Scenario$addMsg,
			A2(_user$project$Scenario$UpdateProperty, edge, s),
			model.undo);
		var newDataModel = A3(_user$project$DataModelActions$updateProperty, edge, s, model.dataModel);
		return _elm_lang$core$Native_Utils.update(
			model,
			{dataModel: newDataModel, undo: newUndo});
	});
var _user$project$ModelActions$updateState = F2(
	function (model, elemState) {
		var _p39 = model.selection;
		if (_p39.ctor === '::') {
			var _p40 = _p39._0;
			var newUndo = A2(
				_user$project$Scenario$addMsg,
				A2(_user$project$Scenario$UpdateState, elemState, _p40),
				model.undo);
			var newDataModel = A3(_user$project$DataModelActions$updateState, _p40, elemState, model.dataModel);
			return _elm_lang$core$Native_Utils.update(
				model,
				{dataModel: newDataModel, undo: newUndo});
		} else {
			return model;
		}
	});
var _user$project$ModelActions$updateNodeRole = F3(
	function (model, networkId, role) {
		var _p41 = model.selection;
		if (_p41.ctor === '::') {
			var _p42 = _p41._0;
			var newUndo = A2(
				_user$project$Scenario$addMsg,
				A3(_user$project$Scenario$UpdateNodeRoles, networkId, role, _p42),
				model.undo);
			var newDataModel = A4(_user$project$DataModelActions$updateNodeRoles, _p42, networkId, role, model.dataModel);
			return _elm_lang$core$Native_Utils.update(
				model,
				{dataModel: newDataModel, undo: newUndo});
		} else {
			return model;
		}
	});
var _user$project$ModelActions$updateOutpowered = function (model) {
	var newUndo = A2(_user$project$Scenario$addMsg, _user$project$Scenario$UpdateOutpowered, model.undo);
	var newDataModel = _user$project$DataModelActions$updateOutpowered(model.dataModel);
	return _elm_lang$core$Native_Utils.update(
		model,
		{dataModel: newDataModel, undo: newUndo});
};
var _user$project$ModelActions$updateAttribute = F2(
	function (model, s) {
		var m_id = function () {
			var _p43 = model.selection;
			if (_p43.ctor === '::') {
				return _elm_lang$core$Maybe$Just(_p43._0);
			} else {
				return _elm_lang$core$Maybe$Nothing;
			}
		}();
		var newDataModel = A3(_user$project$DataModelActions$updateAttribute, m_id, s, model.dataModel);
		var newUndo = A2(
			_user$project$Scenario$addMsg,
			A2(_user$project$Scenario$UpdateAttribute, s, m_id),
			model.undo);
		return _elm_lang$core$Native_Utils.update(
			model,
			{dataModel: newDataModel, undo: newUndo});
	});
var _user$project$ModelActions$updateNodeGeometryProperty = F3(
	function (n, s, model) {
		var newUndo = A2(
			_user$project$Scenario$addMsg,
			A2(_user$project$Scenario$UpdateNodeGeometryProperty, n, s),
			model.undo);
		var newDataModel = A3(_user$project$DataModelActions$updateNodeGeometryProperty, n, s, model.dataModel);
		return _elm_lang$core$Native_Utils.update(
			model,
			{dataModel: newDataModel, undo: newUndo});
	});
var _user$project$ModelActions$deleteGeometry = function (model) {
	var newUndo = A2(
		_user$project$Scenario$addMsg,
		_user$project$Scenario$DeleteGeometry(model.input),
		model.undo);
	var newDataModel = A2(_user$project$DataModelActions$deleteGeometry, model.input, model.dataModel);
	return _elm_lang$core$Native_Utils.update(
		model,
		{dataModel: newDataModel, undo: newUndo});
};
var _user$project$ModelActions$createGeometry = function (model) {
	var newUndo = A2(
		_user$project$Scenario$addMsg,
		_user$project$Scenario$CreateGeometry(model.input),
		model.undo);
	var newDataModel = A2(_user$project$DataModelActions$createGeometry, model.input, model.dataModel);
	return _elm_lang$core$Native_Utils.update(
		model,
		{dataModel: newDataModel, undo: newUndo});
};
var _user$project$ModelActions$deleteGroup = function (model) {
	var newUndo = A2(
		_user$project$Scenario$addMsg,
		_user$project$Scenario$DeleteGroup(model.input),
		model.undo);
	var newDataModel = A2(_user$project$DataModelActions$deleteGroup, model.input, model.dataModel);
	return _elm_lang$core$Native_Utils.update(
		model,
		{dataModel: newDataModel, undo: newUndo});
};
var _user$project$ModelActions$createGroup = function (model) {
	var newUndo = A2(
		_user$project$Scenario$addMsg,
		_user$project$Scenario$CreateGroup(model.input),
		model.undo);
	var newDataModel = A2(_user$project$DataModelActions$createGroup, model.input, model.dataModel);
	return _elm_lang$core$Native_Utils.update(
		model,
		{dataModel: newDataModel, undo: newUndo});
};
var _user$project$ModelActions$deleteParameter = function (model) {
	var newUndo = A2(
		_user$project$Scenario$addMsg,
		_user$project$Scenario$DeleteParameter(model.input),
		model.undo);
	var newDataModel = A2(_user$project$DataModelActions$deleteParameter, model.input, model.dataModel);
	return _elm_lang$core$Native_Utils.update(
		model,
		{dataModel: newDataModel, undo: newUndo});
};
var _user$project$ModelActions$createParameter = function (model) {
	var newUndo = A2(
		_user$project$Scenario$addMsg,
		_user$project$Scenario$CreateParameter(model.input),
		model.undo);
	var newDataModel = A2(_user$project$DataModelActions$createParameter, model.input, model.dataModel);
	return _elm_lang$core$Native_Utils.update(
		model,
		{dataModel: newDataModel, undo: newUndo});
};
var _user$project$ModelActions$isIn_ = F2(
	function (list, set) {
		var _p44 = list;
		if (_p44.ctor === '[]') {
			return true;
		} else {
			return A2(_elm_lang$core$Set$member, _p44._0, set) && A2(_user$project$ModelActions$isIn_, _p44._1, set);
		}
	});
var _user$project$ModelActions$filterLinks_ = F2(
	function (set, list) {
		return A2(
			_elm_lang$core$List$filter,
			function (x) {
				return A2(
					_user$project$ModelActions$isIn_,
					_elm_lang$core$Set$toList(set),
					x.parameters);
			},
			list);
	});
var _user$project$ModelActions$exportLink = function (model) {
	var dataModel = model.dataModel;
	var newEdges = A2(_user$project$ModelActions$filterLinks_, model.exportFlux, model.dataModel.edges);
	var newDataModel = _elm_lang$core$Native_Utils.update(
		dataModel,
		{edges: newEdges});
	var m1 = _user$project$Model$defaultModel;
	return _elm_lang$core$Native_Utils.update(
		m1,
		{dataModel: newDataModel});
};
var _user$project$ModelActions$updateSelectedFlux = F2(
	function (s, model) {
		var maybe_propId = A2(_user$project$LinkParameters$getPropertyIdFromName, s, model.dataModel.parameters);
		var newExportFlux = function () {
			var _p45 = maybe_propId;
			if (_p45.ctor === 'Nothing') {
				return model.exportFlux;
			} else {
				return A2(_user$project$Link$changeActiveProperty, _p45._0, model.exportFlux);
			}
		}();
		return _elm_lang$core$Native_Utils.update(
			model,
			{exportFlux: newExportFlux});
	});
var _user$project$ModelActions$renameNode = function (model) {
	var nId = function () {
		var _p46 = model.selection;
		if (_p46.ctor === '::') {
			return _elm_lang$core$Maybe$Just(_p46._0);
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	}();
	var newName = model.input;
	var newDataModel = A3(_user$project$DataModelActions$renameNode, newName, nId, model.dataModel);
	var newUndo = A2(
		_user$project$Scenario$addMsg,
		A2(_user$project$Scenario$RenameNode, newName, nId),
		model.undo);
	return _elm_lang$core$Native_Utils.update(
		model,
		{dataModel: newDataModel, undo: newUndo});
};
var _user$project$ModelActions$deleteNode = F2(
	function (id, model) {
		var newUndo = A2(
			_user$project$Scenario$addMsg,
			_user$project$Scenario$DeleteNode(id),
			model.undo);
		var newDataModel = A2(_user$project$DataModelActions$deleteNode, id, model.dataModel);
		return _elm_lang$core$Native_Utils.update(
			model,
			{dataModel: newDataModel, undo: newUndo});
	});
var _user$project$ModelActions$deleteEdge = F2(
	function (id, model) {
		var newUndo = A2(
			_user$project$Scenario$addMsg,
			_user$project$Scenario$DeleteLink(id),
			model.undo);
		var newDataModel = A2(_user$project$DataModelActions$deleteEdge, id, model.dataModel);
		return _elm_lang$core$Native_Utils.update(
			model,
			{dataModel: newDataModel, undo: newUndo});
	});
var _user$project$ModelActions$createNode = function (model) {
	var useParent = function () {
		var _p47 = model.nodeViewId;
		if (_p47.ctor === 'Nothing') {
			return _elm_lang$core$Maybe$Nothing;
		} else {
			return A2(_user$project$DataModel$getParentFromNodeId, model.nodeViewId, model.dataModel.nodes);
		}
	}();
	var newParent = function () {
		var _p48 = _elm_lang$core$Native_Utils.cmp(
			_elm_lang$core$List$length(model.selection),
			1) > 0;
		if (_p48 === true) {
			return useParent;
		} else {
			var _p49 = model.selection;
			if (_p49.ctor === '::') {
				return _elm_lang$core$Maybe$Just(_p49._0);
			} else {
				return useParent;
			}
		}
	}();
	var newName = model.input;
	var newDataModel = A3(_user$project$DataModelActions$createNode, newName, newParent, model.dataModel);
	var newUndo = A2(
		_user$project$Scenario$addMsg,
		A2(_user$project$Scenario$CreateNode, newName, newParent),
		model.undo);
	return _elm_lang$core$Native_Utils.update(
		model,
		{dataModel: newDataModel, undo: newUndo});
};
var _user$project$ModelActions$createLink = F3(
	function (s, t, model) {
		var newUndo = A2(
			_user$project$Scenario$addMsg,
			A2(_user$project$Scenario$CreateLink, s, t),
			model.undo);
		var newDataModel = A3(_user$project$DataModelActions$createLink, s, t, model.dataModel);
		var m1 = _elm_lang$core$Native_Utils.update(
			model,
			{
				selectionType: _user$project$Model$LINK(
					A3(_user$project$DataModel$getEdgeIdFromNodesId, s, t, newDataModel.edges)),
				dataModel: newDataModel,
				undo: newUndo
			});
		return m1;
	});

var _user$project$Board$updateNodesPositionForLayout_ = function (model) {
	var dataModel = model.dataModel;
	var newDatamodel = _elm_lang$core$Native_Utils.update(
		dataModel,
		{mustLayout: true});
	var m0 = _elm_lang$core$Native_Utils.update(
		model,
		{dataModel: newDatamodel});
	var m1 = _user$project$ModelActions$updateNodesPosition(m0);
	return m1;
};
var _user$project$Board$modelDataShowAllDataLight_ = function (model) {
	var lowestEdges = _user$project$DataModelActions$lowestLevelEdges(model.dataModel);
	var subModel = model.dataModel;
	var m2 = _elm_lang$core$Native_Utils.update(
		subModel,
		{edges: lowestEdges});
	var m3 = function () {
		var _p0 = subModel.mustLayout;
		if (_p0 === true) {
			return m2;
		} else {
			return _user$project$DataModel$triNodes(m2);
		}
	}();
	return _elm_lang$core$Native_Utils.update(
		model,
		{dataModel: m3});
};
var _user$project$Board$modelShowAllData_ = function (model) {
	var subModel = model.dataModel;
	var m2 = function () {
		var _p1 = subModel.mustLayout;
		if (_p1 === true) {
			return subModel;
		} else {
			return _user$project$DataModel$triNodes(subModel);
		}
	}();
	return _elm_lang$core$Native_Utils.update(
		model,
		{dataModel: m2});
};
var _user$project$Board$showAllData = function (model) {
	return _user$project$Board$modelShowAllData_(
		_user$project$Board$updateNodesPositionForLayout_(model));
};
var _user$project$Board$showAllDataLight = function (model) {
	return _user$project$Board$modelDataShowAllDataLight_(
		_user$project$Board$updateNodesPositionForLayout_(model));
};
var _user$project$Board$getGeometryViewFromId_ = F2(
	function (model, id) {
		var newEdges = A2(
			_elm_lang$core$List$filter,
			function (x) {
				var _p2 = {
					ctor: '_Tuple2',
					_0: A2(_user$project$DataModel$getNodeFromId, x.source, model.nodes),
					_1: A2(_user$project$DataModel$getNodeFromId, x.target, model.nodes)
				};
				var m_s = _p2._0;
				var m_t = _p2._1;
				var res = function () {
					var _p3 = {ctor: '_Tuple2', _0: m_s, _1: m_t};
					if (((_p3.ctor === '_Tuple2') && (_p3._0.ctor === 'Just')) && (_p3._1.ctor === 'Just')) {
						return A2(_user$project$Node$hasGeometry, id, _p3._0._0) && A2(_user$project$Node$hasGeometry, id, _p3._1._0);
					} else {
						return false;
					}
				}();
				return res;
			},
			model.edges);
		var newNodes = A2(
			_elm_lang$core$List$filter,
			function (x) {
				return A2(_user$project$Node$hasGeometry, id, x);
			},
			model.nodes);
		return _elm_lang$core$Native_Utils.update(
			model,
			{nodes: newNodes, edges: newEdges});
	});
var _user$project$Board$getAllGeometries_ = function (model) {
	var newNodes = A2(
		_elm_lang$core$List$filter,
		function (x) {
			return !_elm_lang$core$Native_Utils.eq(x.geometry, _elm_lang$core$Maybe$Nothing);
		},
		model.nodes);
	var newEdges = A2(
		_elm_lang$core$List$filter,
		function (x) {
			return A2(_user$project$DataModel$isNodeIdPresent, x.source, newNodes) && A2(_user$project$DataModel$isNodeIdPresent, x.target, newNodes);
		},
		model.edges);
	return _elm_lang$core$Native_Utils.update(
		model,
		{nodes: newNodes, edges: newEdges});
};
var _user$project$Board$getGeometryView = F2(
	function (model, m_id) {
		var _p4 = m_id;
		if (_p4.ctor === 'Just') {
			var _p5 = _p4._0;
			return A2(
				_user$project$Board$getGeometryViewFromId_,
				_elm_lang$core$Native_Utils.update(
					model,
					{
						geometryImage: A2(_user$project$Geometries$getImageFromId, _p5, model.geometries)
					}),
				_p5);
		} else {
			return _user$project$Board$getAllGeometries_(
				_elm_lang$core$Native_Utils.update(
					model,
					{geometryImage: _elm_lang$core$Maybe$Nothing}));
		}
	});
var _user$project$Board$modelShowGeometry_ = function (model) {
	var dm = A2(_user$project$Board$getGeometryView, model.dataModel, model.geometryId);
	var dm2 = _user$project$DataModel$triNodes(dm);
	return _elm_lang$core$Native_Utils.update(
		model,
		{dataModel: dm2});
};
var _user$project$Board$showGeometry = function (model) {
	return _user$project$Board$modelShowGeometry_(
		_user$project$Board$updateNodesPositionForLayout_(model));
};
var _user$project$Board$getPBSViewFromNodeName = F2(
	function (model, s) {
		return A2(_user$project$ModelManagement$listNodeToPBSFromNodeName, model.nodes, s);
	});
var _user$project$Board$getPBSViewFromNodeId = F2(
	function (model, id) {
		return A2(_user$project$ModelManagement$listNodeToPBSFromNodeId, model.nodes, id);
	});
var _user$project$Board$getBubblesViewFromNodeName = F2(
	function (model, s) {
		return A2(_user$project$ModelManagement$subBubblesModelFromName, model, s);
	});
var _user$project$Board$getBubblesView = function (model) {
	return _user$project$ModelManagement$subBubblesFromUniverse(model);
};
var _user$project$Board$getBubblesViewFromNodeId = F2(
	function (model, id) {
		return A2(_user$project$ModelManagement$subBubblesModelFromId, model, id);
	});
var _user$project$Board$modelShowBubbles_ = function (model) {
	var m1 = _user$project$ModelManagement$filterWithMask(model.dataModel);
	var subModel = function () {
		var _p6 = model.nodeViewId;
		if (_p6.ctor === 'Nothing') {
			return _user$project$Board$getBubblesView(m1);
		} else {
			return A2(_user$project$Board$getBubblesViewFromNodeId, m1, _p6._0);
		}
	}();
	var m2 = _user$project$DataModel$triNodes(subModel);
	return _elm_lang$core$Native_Utils.update(
		model,
		{dataModel: m2});
};
var _user$project$Board$showBubbles = function (model) {
	return _user$project$Board$modelShowBubbles_(
		_user$project$Board$updateNodesPositionForLayout_(model));
};
var _user$project$Board$getPBSView = function (model) {
	return _user$project$ModelManagement$listNodeToPBS(model.nodes);
};
var _user$project$Board$showPBS = function (model) {
	var subModel = function () {
		var _p7 = model.nodeViewId;
		if (_p7.ctor === 'Nothing') {
			return _user$project$Board$getPBSView(model.dataModel);
		} else {
			return A2(_user$project$Board$getPBSViewFromNodeId, model.dataModel, _p7._0);
		}
	}();
	return subModel;
};
var _user$project$Board$formatDisplayGeometryMessage = function (model) {
	return A2(
		_user$project$LinkToJS$makeJsData,
		'display-geometry',
		_user$project$DataModelEncoders$encodeModel(
			_user$project$Board$showGeometry(model).dataModel));
};
var _user$project$Board$displayGeometry = function (model) {
	return _user$project$LinkToJS$msg2js(
		_user$project$Board$formatDisplayGeometryMessage(model));
};
var _user$project$Board$formatDisplayFlatMessage = function (model) {
	return A2(
		_user$project$LinkToJS$makeJsData,
		'display-flat',
		_user$project$DataModelEncoders$encodeModel(
			_user$project$Board$showAllDataLight(model).dataModel));
};
var _user$project$Board$displayFlat = function (model) {
	return _user$project$LinkToJS$msg2js(
		_user$project$Board$formatDisplayFlatMessage(model));
};
var _user$project$Board$formatDisplayAllMessage = function (model) {
	return A2(
		_user$project$LinkToJS$makeJsData,
		'display-all',
		_user$project$DataModelEncoders$encodeModel(
			_user$project$Board$showAllData(model).dataModel));
};
var _user$project$Board$displayAll = function (model) {
	return _user$project$LinkToJS$msg2js(
		_user$project$Board$formatDisplayAllMessage(model));
};
var _user$project$Board$formatDisplayPbsMessage = function (model) {
	return A2(
		_user$project$LinkToJS$makeJsData,
		'display-pbs',
		_user$project$DataModelEncoders$encodeModel(
			_user$project$Board$showPBS(model)));
};
var _user$project$Board$displayPbs = function (model) {
	return _user$project$LinkToJS$msg2js(
		_user$project$Board$formatDisplayPbsMessage(model));
};
var _user$project$Board$formatDisplayBubbleMessage = function (model) {
	return A2(
		_user$project$LinkToJS$makeJsData,
		'display-bubble',
		_user$project$DataModelEncoders$encodeModel(
			_user$project$Board$showAllDataLight(
				_user$project$Board$showBubbles(model)).dataModel));
};
var _user$project$Board$displayBubble = function (model) {
	return _user$project$LinkToJS$msg2js(
		_user$project$Board$formatDisplayBubbleMessage(model));
};

var _user$project$Actions$initModelHighlights = function (model) {
	var dataModel = model.dataModel;
	var initNodes = A2(
		_elm_lang$core$List$map,
		function (x) {
			return _elm_lang$core$Native_Utils.update(
				x,
				{highLighted: 0});
		},
		dataModel.nodes);
	var initEdges = A2(
		_elm_lang$core$List$map,
		function (x) {
			return _elm_lang$core$Native_Utils.update(
				x,
				{highLighted: 0});
		},
		dataModel.edges);
	var dm1 = _elm_lang$core$Native_Utils.update(
		dataModel,
		{nodes: initNodes, edges: initEdges});
	return _elm_lang$core$Native_Utils.update(
		model,
		{dataModel: dm1, propagationDone: false});
};
var _user$project$Actions$processFocus = F2(
	function (msg, list) {
		var taskFocus = A2(
			_elm_lang$core$Task$attempt,
			_user$project$Messages$FocusResult,
			_elm_lang$dom$Dom$focus('input'));
		var _p0 = msg;
		if (_p0.ctor === 'KeyUps') {
			var _p1 = _p0._0;
			switch (_p1) {
				case 86:
					return list;
				case 88:
					return list;
				default:
					return _elm_lang$core$List$concat(
						{
							ctor: '::',
							_0: list,
							_1: {
								ctor: '::',
								_0: {
									ctor: '::',
									_0: taskFocus,
									_1: {ctor: '[]'}
								},
								_1: {ctor: '[]'}
							}
						});
			}
		} else {
			return _elm_lang$core$List$concat(
				{
					ctor: '::',
					_0: list,
					_1: {
						ctor: '::',
						_0: {
							ctor: '::',
							_0: taskFocus,
							_1: {ctor: '[]'}
						},
						_1: {ctor: '[]'}
					}
				});
		}
	});
var _user$project$Actions$displayGeometry = function (model) {
	return {
		ctor: '_Tuple2',
		_0: model,
		_1: _user$project$Board$displayGeometry(model)
	};
};
var _user$project$Actions$displayBubble = function (model) {
	return {
		ctor: '_Tuple2',
		_0: model,
		_1: _user$project$Board$displayBubble(model)
	};
};
var _user$project$Actions$displayPbs = function (model) {
	return {
		ctor: '_Tuple2',
		_0: model,
		_1: _user$project$Board$displayPbs(model)
	};
};
var _user$project$Actions$displayFlat = function (model) {
	return {
		ctor: '_Tuple2',
		_0: model,
		_1: _user$project$Board$displayFlat(model)
	};
};
var _user$project$Actions$displayAll = function (model) {
	return {
		ctor: '_Tuple2',
		_0: model,
		_1: _user$project$Board$displayAll(model)
	};
};
var _user$project$Actions$showView = F2(
	function (msg, model) {
		var cmd1 = function () {
			var _p2 = model.selectionType;
			if (_p2.ctor === 'PARENT') {
				return _user$project$LinkToJS$sendParentSelection(
					_user$project$DataModelEncoders$encodeMaybeIdentifier(
						_user$project$Selection$getFirstSelectionIdentifier(model.selection)));
			} else {
				return _user$project$LinkToJS$sendParentSelection(
					_user$project$DataModelEncoders$encodeMaybeIdentifier(_p2._0));
			}
		}();
		var _p3 = function () {
			var _p4 = model.viewType;
			switch (_p4.ctor) {
				case 'All':
					return _user$project$Actions$displayAll(model);
				case 'Pbs':
					return _user$project$Actions$displayPbs(model);
				case 'Bubble':
					return _user$project$Actions$displayBubble(model);
				case 'Flat':
					return _user$project$Actions$displayFlat(model);
				default:
					return _user$project$Actions$displayGeometry(model);
			}
		}();
		var m1 = _p3._0;
		var cmd = _p3._1;
		var m2 = _elm_lang$core$Native_Utils.update(
			m1,
			{
				selection: {ctor: '[]'},
				selectionType: _user$project$Model$PARENT
			});
		var cmds_list = {
			ctor: '::',
			_0: cmd,
			_1: {
				ctor: '::',
				_0: cmd1,
				_1: {ctor: '[]'}
			}
		};
		var cl1 = A2(_user$project$Actions$processFocus, msg, cmds_list);
		return {
			ctor: '_Tuple2',
			_0: m2,
			_1: _elm_lang$core$Platform_Cmd$batch(cl1)
		};
	});
var _user$project$Actions$deleteElement = F2(
	function (msg, model) {
		var b = A2(_user$project$SpecialKey$member, 16, model.specialKey);
		var m1 = function () {
			var _p5 = {ctor: '_Tuple2', _0: model.selection, _1: b};
			if (((_p5.ctor === '_Tuple2') && (_p5._0.ctor === '::')) && (_p5._1 === true)) {
				var _p7 = _p5._0._0;
				var _p6 = A2(_user$project$DataModel$isNodeIdPresent, _p7, model.dataModel.nodes);
				if (_p6 === true) {
					return A2(_user$project$ModelActions$deleteNode, _p7, model);
				} else {
					return A2(_user$project$ModelActions$deleteEdge, _p7, model);
				}
			} else {
				return model;
			}
		}();
		return A2(_user$project$Actions$showView, msg, m1);
	});
var _user$project$Actions$upView = F2(
	function (msg, model) {
		var maybe_parent = A2(_user$project$DataModel$getParentFromNodeId, model.nodeViewId, model.dataModel.nodes);
		var m0 = _elm_lang$core$Native_Utils.update(
			model,
			{nodeViewId: maybe_parent});
		return A2(_user$project$Actions$showView, msg, m0);
	});
var _user$project$Actions$globalUpdate = F2(
	function (msg, model) {
		var _p8 = msg;
		switch (_p8.ctor) {
			case 'NoOp':
				return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
			case 'Undo':
				return A2(
					_user$project$Actions$showView,
					msg,
					_user$project$ModelActions$undo(model));
			case 'Redo':
				return A2(
					_user$project$Actions$showView,
					msg,
					_user$project$ModelActions$redo(model));
			case 'Layout':
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: _user$project$LinkToJS$layout('')
				};
			case 'GetPositions':
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: _user$project$LinkToJS$requestpositions('')
				};
			case 'NodesPositionRequest':
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: function () {
						var _p9 = model.viewType;
						switch (_p9.ctor) {
							case 'Flat':
								return _user$project$LinkToJS$requestpositions('');
							case 'Bubble':
								return _user$project$LinkToJS$requestpositions('');
							default:
								return _elm_lang$core$Platform_Cmd$none;
						}
					}()
				};
			case 'UpdateTightness':
				return A2(
					_user$project$Actions$showView,
					msg,
					_user$project$ModelActions$updateTightness(model));
			case 'HighLightGroup':
				return A2(
					_user$project$Actions$showView,
					msg,
					A2(_user$project$ModelActions$highLightGroup, _p8._0, model));
			case 'SelectedParameters':
				return A2(
					_user$project$Actions$showView,
					msg,
					A2(_user$project$ModelActions$selectedParameters, _p8._0, model));
			case 'GroupNodes':
				return A2(
					_user$project$Actions$showView,
					msg,
					_user$project$ModelActions$groupNodes(model));
			case 'UpdateAttribute':
				return {
					ctor: '_Tuple2',
					_0: A2(_user$project$ModelActions$updateAttribute, model, _p8._0),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'FocusOn':
				return A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					model,
					{
						ctor: '::',
						_0: A2(
							_elm_lang$core$Task$attempt,
							_user$project$Messages$FocusResult,
							_elm_lang$dom$Dom$focus(_p8._0)),
						_1: {ctor: '[]'}
					});
			case 'FocusResult':
				var _p10 = _p8._0;
				if (_p10.ctor === 'Err') {
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						_elm_lang$core$Native_Utils.update(
							model,
							{
								error: _elm_lang$core$Maybe$Just(
									A2(_elm_lang$core$Basics_ops['++'], 'Could not find dom id: ', _p10._0._0))
							}),
						{ctor: '[]'});
				} else {
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						_elm_lang$core$Native_Utils.update(
							model,
							{error: _elm_lang$core$Maybe$Nothing}),
						{ctor: '[]'});
				}
			case 'CreateParameter':
				return {
					ctor: '_Tuple2',
					_0: _user$project$ModelActions$createParameter(model),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'DeleteParameter':
				return {
					ctor: '_Tuple2',
					_0: _user$project$ModelActions$deleteParameter(model),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'SaveToImage':
				var imgName = function () {
					var _p11 = _elm_lang$core$String$isEmpty(model.inputFile);
					if (_p11 === true) {
						return 'graph';
					} else {
						return model.inputFile;
					}
				}();
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: _elm_lang$core$Platform_Cmd$batch(
						{
							ctor: '::',
							_0: _user$project$LinkToJS$saveToImage(imgName),
							_1: {ctor: '[]'}
						})
				};
			case 'ExportLink':
				var saveName = function () {
					var _p12 = _elm_lang$core$String$isEmpty(model.inputFile);
					if (_p12 === true) {
						return 'export';
					} else {
						return model.inputFile;
					}
				}();
				var expNodes = _user$project$DataModelEncoders$encodeExport(
					{
						filename: A2(_elm_lang$core$Basics_ops['++'], saveName, 'Nodes.txt'),
						model: _user$project$Export$encodeNodes(model.dataModel)
					});
				var expEdges = _user$project$DataModelEncoders$encodeExport(
					{
						filename: A2(_elm_lang$core$Basics_ops['++'], saveName, 'Links.csv'),
						model: _user$project$Export$encodeLinks(model.dataModel)
					});
				var expPropagationOnNodes = _user$project$DataModelEncoders$encodeExport(
					{
						filename: A2(_elm_lang$core$Basics_ops['++'], saveName, 'Propagation.csv'),
						model: _user$project$Export$encodePropagation(model.dataModel)
					});
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: _elm_lang$core$Platform_Cmd$batch(
						{
							ctor: '::',
							_0: _user$project$LinkToJS$exportLNK(expNodes),
							_1: {
								ctor: '::',
								_0: _user$project$LinkToJS$exportLNK(expEdges),
								_1: {
									ctor: '::',
									_0: _user$project$LinkToJS$exportLNK(expPropagationOnNodes),
									_1: {ctor: '[]'}
								}
							}
						})
				};
			case 'CheckFlux':
				return {
					ctor: '_Tuple2',
					_0: A2(_user$project$ModelActions$updateSelectedFlux, _p8._0, model),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'CheckProperty':
				return {
					ctor: '_Tuple2',
					_0: A3(_user$project$ModelActions$updateProperty, _p8._0, _p8._1, model),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'CheckNodeGroupProperty':
				return {
					ctor: '_Tuple2',
					_0: A3(_user$project$ModelActions$updateNodeGroupProperty, _p8._0, _p8._1, model),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'CreateGroup':
				return {
					ctor: '_Tuple2',
					_0: _user$project$ModelActions$createGroup(model),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'DeleteGroup':
				var m1 = _user$project$ModelActions$deleteGroup(model);
				return A2(_user$project$Actions$showView, msg, m1);
			case 'CreateGeometry':
				return {
					ctor: '_Tuple2',
					_0: _user$project$ModelActions$createGeometry(model),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'DeleteGeometry':
				return {
					ctor: '_Tuple2',
					_0: _user$project$ModelActions$deleteGeometry(model),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'CheckNodeGeometryProperty':
				return {
					ctor: '_Tuple2',
					_0: A3(_user$project$ModelActions$updateNodeGeometryProperty, _p8._0, _p8._1, model),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'HighLightGeometry':
				return A2(
					_user$project$Actions$showView,
					msg,
					A2(_user$project$ModelActions$highLightGeometry, _p8._0, model));
			case 'LoadGeometry':
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: _user$project$LinkToJS$loadGeometryRequest(
						function () {
							var _p13 = model.selectedGeometryId;
							if (_p13.ctor === 'Nothing') {
								return {ctor: '[]'};
							} else {
								return {
									ctor: '::',
									_0: _p13._0,
									_1: {ctor: '[]'}
								};
							}
						}())
				};
			case 'LoadGeometryButton':
				var _p14 = _p8._0;
				var m_geometry = A2(_user$project$Geometries$getPropertyIdFromName, _p14, model.dataModel.geometries);
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{selectedGeometryId: m_geometry}),
					_1: _user$project$LinkToJS$loadGeometryButton(_p14)
				};
			case 'SendGeometryToElm':
				return {
					ctor: '_Tuple2',
					_0: A2(_user$project$ModelActions$sendGeometryName, _p8._0, model),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'SwitchToView':
				var m1 = _elm_lang$core$Native_Utils.update(
					model,
					{viewType: _p8._0});
				return A2(_user$project$Actions$showView, msg, m1);
			case 'SwitchToLayout':
				var _p15 = _p8._0;
				var newLayoutMenu = A2(_user$project$LayoutMenuActions$layoutPicked, _p15, model.layoutMenu);
				var m1 = _elm_lang$core$Native_Utils.update(
					model,
					{layoutMenu: newLayoutMenu});
				return {
					ctor: '_Tuple2',
					_0: m1,
					_1: _elm_lang$core$Platform_Cmd$batch(
						{
							ctor: '::',
							_0: _user$project$LinkToJS$setLayoutNameThenLayout(_p15),
							_1: {ctor: '[]'}
						})
				};
			case 'SwitchElemRole':
				var m1 = _user$project$Actions$initModelHighlights(model);
				return A2(
					_user$project$Actions$showView,
					msg,
					A3(_user$project$ModelActions$updateNodeRole, m1, _p8._0, _p8._1));
			case 'SwitchElemState':
				var m1 = _user$project$Actions$initModelHighlights(model);
				return A2(
					_user$project$Actions$showView,
					msg,
					A2(_user$project$ModelActions$updateState, m1, _p8._0));
			case 'CreateNode':
				return A2(
					_user$project$Actions$showView,
					msg,
					_user$project$ModelActions$createNode(model));
			case 'RenameNode':
				return A2(
					_user$project$Actions$showView,
					msg,
					_user$project$ModelActions$renameNode(model));
			case 'CreateLink':
				var _p16 = model.selection;
				if (((_p16.ctor === '::') && (_p16._1.ctor === '::')) && (_p16._1._1.ctor === '[]')) {
					return A2(
						_user$project$Actions$showView,
						msg,
						A3(_user$project$ModelActions$createLink, _p16._0, _p16._1._0, model));
				} else {
					return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
				}
			case 'InputChange':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{input: _p8._0}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'InputFileChange':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{inputFile: _p8._0}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'Selection':
				var x = _user$project$Selection$decodeFromJSMsg(_p8._0);
				var newSelection = A2(_user$project$Selection$updateModelSelection, model.selection, x);
				var m1 = _elm_lang$core$Native_Utils.update(
					model,
					{selection: newSelection});
				return {ctor: '_Tuple2', _0: m1, _1: _elm_lang$core$Platform_Cmd$none};
			case 'ModelToElm':
				var m1 = A2(_user$project$ModelActions$dataModelToModel, _p8._0, model);
				return A2(_user$project$Actions$showView, msg, m1);
			case 'CsvModelToElm':
				var m1 = A2(_user$project$ModelActions$loadCsv2Model, _p8._0, model);
				return A2(_user$project$Actions$showView, msg, m1);
			case 'Csv2ModelToElm':
				var m1 = A2(_user$project$ModelActions$loadCsvModel, _p8._0, model);
				return A2(_user$project$Actions$showView, msg, m1);
			case 'ImportModelToElm':
				var m1 = A2(_user$project$ModelActions$dataImportModelToModel, _p8._0, model);
				return {ctor: '_Tuple2', _0: m1, _1: _elm_lang$core$Platform_Cmd$none};
			case 'ImportCsvModeltoElm':
				var m1 = A2(_user$project$ModelActions$dataImportCsvModelToModel, _p8._0, model);
				return {ctor: '_Tuple2', _0: m1, _1: _elm_lang$core$Platform_Cmd$none};
			case 'NodesPositionToElm':
				var _p18 = _p8._0;
				var m1 = function () {
					var _p17 = model.viewType;
					switch (_p17.ctor) {
						case 'Flat':
							return A2(_user$project$ModelActions$updateLightLayout, _p18, model);
						case 'Geometry':
							return A2(_user$project$ModelActions$updateGeometryLayout, _p18, model);
						default:
							return A2(_user$project$ModelActions$updateLayoutFromNodeId, _p18, model);
					}
				}();
				return {ctor: '_Tuple2', _0: m1, _1: _elm_lang$core$Platform_Cmd$none};
			case 'SaveModel':
				var saveName = function () {
					var _p19 = _elm_lang$core$String$isEmpty(model.inputFile);
					if (_p19 === true) {
						return 'model.json';
					} else {
						return model.inputFile;
					}
				}();
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: _user$project$LinkToJS$saveModel(
						_user$project$DataModelEncoders$encodeMetaModel(
							{filename: saveName, model: model.dataModel}))
				};
			case 'LoadModel':
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: _user$project$LinkToJS$loadModel(model.loadModelId)
				};
			case 'KeyDowns':
				var _p21 = _p8._0;
				var _p20 = _p21;
				switch (_p20) {
					case 16:
						return {
							ctor: '_Tuple2',
							_0: A2(_user$project$ModelActions$insertKey, _p21, model),
							_1: _elm_lang$core$Platform_Cmd$none
						};
					case 17:
						return {
							ctor: '_Tuple2',
							_0: A2(_user$project$ModelActions$insertKey, _p21, model),
							_1: _elm_lang$core$Platform_Cmd$none
						};
					default:
						return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
				}
			case 'KeyUps':
				var _p23 = _p8._0;
				var _p22 = _p23;
				switch (_p22) {
					case 16:
						return {
							ctor: '_Tuple2',
							_0: A2(_user$project$ModelActions$removeKey, _p23, model),
							_1: _elm_lang$core$Platform_Cmd$none
						};
					case 17:
						return {
							ctor: '_Tuple2',
							_0: A2(_user$project$ModelActions$removeKey, _p23, model),
							_1: _elm_lang$core$Platform_Cmd$none
						};
					case 38:
						return A2(_user$project$Actions$upView, msg, model);
					case 45:
						return A2(
							_user$project$Actions$showView,
							msg,
							_user$project$ModelActions$mask(model));
					case 46:
						return A2(_user$project$Actions$deleteElement, msg, model);
					case 67:
						return {
							ctor: '_Tuple2',
							_0: _user$project$ModelActions$ctrlC(model),
							_1: _elm_lang$core$Platform_Cmd$none
						};
					case 86:
						return A2(
							_user$project$Actions$showView,
							msg,
							_user$project$ModelActions$ctrlV(model));
					case 88:
						return A2(
							_user$project$Actions$showView,
							msg,
							_user$project$ModelActions$ctrlX(model));
					case 112:
						return A2(
							_user$project$Actions$showView,
							msg,
							_user$project$ModelActions$searchElement(model));
					case 113:
						return A2(
							_user$project$Actions$showView,
							msg,
							_user$project$ModelActions$blow(model));
					default:
						return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
				}
			case 'DoubleClick':
				var element = _user$project$Selection$decodeFromJSId(_p8._0);
				var newNodeViewId = function () {
					var _p24 = element.err;
					if (_p24 === true) {
						return _elm_lang$core$Maybe$Nothing;
					} else {
						return _elm_lang$core$Maybe$Just(element.id);
					}
				}();
				var m1 = _elm_lang$core$Native_Utils.update(
					model,
					{nodeViewId: newNodeViewId});
				return A2(_user$project$Actions$showView, msg, m1);
			case 'OnOpen':
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: _user$project$LinkToJS$onOpen('')
				};
			case 'OnImport':
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: _user$project$LinkToJS$onImport('')
				};
			case 'ImportModel':
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: _user$project$LinkToJS$importModel('importModel')
				};
			case 'ShowHideFunctionalChain':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{showFunctionalChain: !model.showFunctionalChain}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'ShowHideGeometries':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{showGeometries: !model.showGeometries}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'ShowHideParameters':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{showParameters: !model.showParameters}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'Verification':
				var dm = _user$project$Verification$verificationBlocs(model.dataModel);
				var dm2 = _user$project$Verification$verification(dm);
				var m1 = _elm_lang$core$Native_Utils.update(
					model,
					{dataModel: dm2});
				var _p25 = A2(_elm_lang$core$Debug$log, 'verif', model.dataModel);
				return {ctor: '_Tuple2', _0: m1, _1: _elm_lang$core$Platform_Cmd$none};
			default:
				if (_elm_lang$core$Native_Utils.eq(model.propagationDone, false)) {
					var newModel = _elm_lang$core$Native_Utils.update(
						model,
						{propagationDone: true});
					return A2(
						_user$project$Actions$showView,
						msg,
						_user$project$ModelActions$updateOutpowered(newModel));
				} else {
					return A2(
						_user$project$Actions$showView,
						msg,
						_user$project$Actions$initModelHighlights(model));
				}
		}
	});
var _user$project$Actions$update = F2(
	function (msg, model) {
		var searchBuildList = A2(_user$project$Search$mustBuildList, model.searchModel, true);
		var m1 = function () {
			var _p26 = msg;
			switch (_p26.ctor) {
				case 'FocusOn':
					return model;
				case 'FocusResult':
					return model;
				case 'CreateNode':
					return _elm_lang$core$Native_Utils.update(
						model,
						{searchModel: searchBuildList});
				case 'RenameNode':
					return _elm_lang$core$Native_Utils.update(
						model,
						{searchModel: searchBuildList});
				case 'CreateLink':
					return model;
				case 'InputChange':
					return _elm_lang$core$Native_Utils.update(
						model,
						{searchModel: searchBuildList});
				case 'InputFileChange':
					return model;
				case 'Selection':
					return model;
				case 'ModelToElm':
					return _elm_lang$core$Native_Utils.update(
						model,
						{searchModel: searchBuildList});
				case 'CsvModelToElm':
					return _elm_lang$core$Native_Utils.update(
						model,
						{searchModel: searchBuildList});
				case 'Csv2ModelToElm':
					return _elm_lang$core$Native_Utils.update(
						model,
						{searchModel: searchBuildList});
				case 'ImportModelToElm':
					return _elm_lang$core$Native_Utils.update(
						model,
						{searchModel: searchBuildList});
				case 'ImportCsvModeltoElm':
					return _elm_lang$core$Native_Utils.update(
						model,
						{searchModel: searchBuildList});
				case 'NodesPositionToElm':
					return model;
				case 'SaveModel':
					return model;
				case 'LoadModel':
					return model;
				case 'SwitchToView':
					return model;
				case 'SwitchElemRole':
					return model;
				case 'SwitchElemState':
					return model;
				case 'KeyUps':
					var _p27 = _p26._0;
					if (_p27 === 46) {
						return _elm_lang$core$Native_Utils.update(
							model,
							{searchModel: searchBuildList});
					} else {
						return model;
					}
				case 'KeyDowns':
					return model;
				case 'DoubleClick':
					return model;
				case 'CheckProperty':
					return model;
				case 'CheckFlux':
					return model;
				case 'ExportLink':
					return model;
				case 'CreateParameter':
					return model;
				case 'DeleteParameter':
					return model;
				case 'UpdateAttribute':
					return model;
				case 'GroupNodes':
					return _elm_lang$core$Native_Utils.update(
						model,
						{searchModel: searchBuildList});
				case 'CheckNodeGroupProperty':
					return model;
				case 'CreateGroup':
					return model;
				case 'DeleteGroup':
					return model;
				case 'HighLightGroup':
					return model;
				case 'SelectedParameters':
					return model;
				case 'UpdateTightness':
					return model;
				case 'Layout':
					return model;
				case 'GetPositions':
					return model;
				case 'Undo':
					return _elm_lang$core$Native_Utils.update(
						model,
						{searchModel: searchBuildList});
				case 'Redo':
					return _elm_lang$core$Native_Utils.update(
						model,
						{searchModel: searchBuildList});
				case 'NodesPositionRequest':
					return model;
				case 'OnOpen':
					return model;
				case 'OnImport':
					return model;
				case 'ImportModel':
					return model;
				case 'SaveToImage':
					return model;
				case 'CreateGeometry':
					return model;
				case 'DeleteGeometry':
					return model;
				case 'CheckNodeGeometryProperty':
					return model;
				case 'HighLightGeometry':
					return model;
				case 'LoadGeometry':
					return model;
				case 'LoadGeometryButton':
					return model;
				case 'SendGeometryToElm':
					return model;
				case 'SwitchToLayout':
					return model;
				case 'ShowHideFunctionalChain':
					return model;
				case 'ShowHideGeometries':
					return model;
				case 'ShowHideParameters':
					return model;
				case 'Verification':
					return model;
				case 'Propagation':
					return model;
				default:
					return model;
			}
		}();
		return A2(_user$project$Actions$globalUpdate, msg, m1);
	});

var _user$project$AttributView$textarea_ = function (attribut) {
	return A2(
		_elm_lang$html$Html$textarea,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$value(attribut),
			_1: {
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$id('attributArea'),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Events$onInput(_user$project$Messages$UpdateAttribute),
					_1: {ctor: '[]'}
				}
			}
		},
		{ctor: '[]'});
};
var _user$project$AttributView$exposeMaybeAttribut_ = function (m_attribut) {
	var txt = function () {
		var _p0 = m_attribut;
		if (_p0.ctor === 'Nothing') {
			return '';
		} else {
			return _p0._0;
		}
	}();
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: _user$project$AttributView$textarea_(txt),
			_1: {ctor: '[]'}
		});
};
var _user$project$AttributView$expose = function (model) {
	var m_id = function () {
		var _p1 = model.selection;
		if (_p1.ctor === '::') {
			return _elm_lang$core$Maybe$Just(_p1._0);
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	}();
	var m_node = function () {
		var _p2 = m_id;
		if (_p2.ctor === 'Nothing') {
			return _elm_lang$core$Maybe$Nothing;
		} else {
			return A2(_user$project$DataModel$getNodeFromId, _p2._0, model.dataModel.nodes);
		}
	}();
	var m_edge = function () {
		var _p3 = m_id;
		if (_p3.ctor === 'Nothing') {
			return _elm_lang$core$Maybe$Nothing;
		} else {
			return A2(_user$project$DataModel$getEdgeFromId, _p3._0, model.dataModel.edges);
		}
	}();
	var m_attribut = function () {
		var _p4 = {ctor: '_Tuple2', _0: m_edge, _1: m_node};
		_v4_2:
		do {
			if (_p4._0.ctor === 'Nothing') {
				if (_p4._1.ctor === 'Just') {
					return _p4._1._0.attribut;
				} else {
					break _v4_2;
				}
			} else {
				if (_p4._1.ctor === 'Nothing') {
					return _p4._0._0.attribut;
				} else {
					break _v4_2;
				}
			}
		} while(false);
		return _elm_lang$core$Maybe$Nothing;
	}();
	return _user$project$AttributView$exposeMaybeAttribut_(m_attribut);
};
var _user$project$AttributView$view = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$id('attribut'),
			_1: {
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('vItem'),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'text-align', _1: 'center'},
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			}
		},
		{
			ctor: '::',
			_0: _elm_lang$html$Html$text('Attribut'),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$hr,
					{ctor: '[]'},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: _user$project$AttributView$expose(model),
					_1: {ctor: '[]'}
				}
			}
		});
};

var _user$project$ElementAttributesView$getLegendName = F2(
	function (id, parameters) {
		var name = A2(_user$project$LinkParameters$getPropertyNameFromId, id, parameters);
		var _p0 = name;
		if (_p0.ctor === 'Nothing') {
			return '';
		} else {
			return _p0._0;
		}
	});
var _user$project$ElementAttributesView$radio = F4(
	function (s, msg, value, b) {
		return A2(
			_elm_lang$html$Html$label,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('role-network'),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$input,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$type_('radio'),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$name(s),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Events$onClick(msg),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$checked(b),
									_1: {ctor: '[]'}
								}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html$text(value),
					_1: {ctor: '[]'}
				}
			});
	});
var _user$project$ElementAttributesView$roleFieldset = F2(
	function (parameters, networkRole) {
		var legendLabel = A2(_user$project$ElementAttributesView$getLegendName, networkRole.network, parameters);
		var network = _elm_lang$core$Basics$toString(networkRole.network);
		var fieldsetName = A2(_elm_lang$core$Basics_ops['++'], 'role-network-', network);
		var radioName = A2(_elm_lang$core$Basics_ops['++'], 'r-n-', network);
		return A2(
			_elm_lang$html$Html$fieldset,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$id(fieldsetName),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$legend,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text(legendLabel),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A4(
						_user$project$ElementAttributesView$radio,
						radioName,
						A2(_user$project$Messages$SwitchElemRole, networkRole.network, _user$project$ElementAttributes$Producer),
						'Prod.',
						_elm_lang$core$Native_Utils.eq(networkRole.role, _user$project$ElementAttributes$Producer)),
					_1: {
						ctor: '::',
						_0: A4(
							_user$project$ElementAttributesView$radio,
							radioName,
							A2(_user$project$Messages$SwitchElemRole, networkRole.network, _user$project$ElementAttributes$Consumer),
							'Consum.',
							_elm_lang$core$Native_Utils.eq(networkRole.role, _user$project$ElementAttributes$Consumer)),
						_1: {
							ctor: '::',
							_0: A4(
								_user$project$ElementAttributesView$radio,
								radioName,
								A2(_user$project$Messages$SwitchElemRole, networkRole.network, _user$project$ElementAttributes$RoleUnknown),
								'None',
								_elm_lang$core$Native_Utils.eq(networkRole.role, _user$project$ElementAttributes$RoleUnknown)),
							_1: {ctor: '[]'}
						}
					}
				}
			});
	});
var _user$project$ElementAttributesView$rolesFieldset = F2(
	function (roles, parameters) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('roles-fieldsets'),
				_1: {ctor: '[]'}
			},
			A2(
				_elm_lang$core$List$map,
				_user$project$ElementAttributesView$roleFieldset(parameters),
				roles));
	});
var _user$project$ElementAttributesView$stateFieldset = function (state) {
	return A2(
		_elm_lang$html$Html$fieldset,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$id('elementState'),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: A4(
				_user$project$ElementAttributesView$radio,
				'elemState',
				_user$project$Messages$SwitchElemState(_user$project$ElementAttributes$RAS),
				'RAS',
				_elm_lang$core$Native_Utils.eq(state, _user$project$ElementAttributes$RAS)),
			_1: {
				ctor: '::',
				_0: A4(
					_user$project$ElementAttributesView$radio,
					'elemState',
					_user$project$Messages$SwitchElemState(_user$project$ElementAttributes$HS),
					'HS',
					_elm_lang$core$Native_Utils.eq(state, _user$project$ElementAttributes$HS)),
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$ElementAttributesView$getFieldsetNode = F3(
	function (id, nodes, parameters) {
		return A2(
			_elm_lang$html$Html$div,
			{ctor: '[]'},
			function () {
				var _p1 = A2(_user$project$DataModel$getNodeFromId, id, nodes);
				if (_p1.ctor === 'Nothing') {
					return {ctor: '[]'};
				} else {
					var _p2 = _p1._0;
					return {
						ctor: '::',
						_0: _user$project$ElementAttributesView$stateFieldset(_p2.state),
						_1: {
							ctor: '::',
							_0: A2(_user$project$ElementAttributesView$rolesFieldset, _p2.roles, parameters),
							_1: {ctor: '[]'}
						}
					};
				}
			}());
	});
var _user$project$ElementAttributesView$getFieldsetEdge = F2(
	function (id, edges) {
		return A2(
			_elm_lang$html$Html$div,
			{ctor: '[]'},
			function () {
				var _p3 = A2(_user$project$DataModel$getEdgeFromId, id, edges);
				if (_p3.ctor === 'Nothing') {
					return {ctor: '[]'};
				} else {
					return {
						ctor: '::',
						_0: _user$project$ElementAttributesView$stateFieldset(_p3._0.state),
						_1: {ctor: '[]'}
					};
				}
			}());
	});
var _user$project$ElementAttributesView$makeElementAttributesView = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		function () {
			var _p4 = model.selection;
			if (_p4.ctor === '::') {
				var _p5 = _p4._0;
				return {
					ctor: '::',
					_0: A3(_user$project$ElementAttributesView$getFieldsetNode, _p5, model.dataModel.nodes, model.dataModel.parameters),
					_1: {
						ctor: '::',
						_0: A2(_user$project$ElementAttributesView$getFieldsetEdge, _p5, model.dataModel.edges),
						_1: {ctor: '[]'}
					}
				};
			} else {
				return {ctor: '[]'};
			}
		}());
};
var _user$project$ElementAttributesView$view = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('div-element-type'),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: _user$project$ElementAttributesView$makeElementAttributesView(model),
			_1: {ctor: '[]'}
		});
};

var _user$project$GeometriesView$checkbox = F3(
	function (b, msg, name) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$id('checkbox'),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'padding', _1: '10px'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'text-align', _1: 'left'},
								_1: {ctor: '[]'}
							}
						}),
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$label,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$input,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$type_('checkbox'),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Events$onClick(msg),
									_1: {
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$checked(b),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html$text(name),
							_1: {ctor: '[]'}
						}
					}),
				_1: {ctor: '[]'}
			});
	});
var _user$project$GeometriesView$chb = F4(
	function (_p0, msg1, msg2, name) {
		var _p1 = _p0;
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$style(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'padding', _1: '10px'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'text-align', _1: 'left'},
							_1: {ctor: '[]'}
						}
					}),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$input,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$type_('checkbox'),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Events$onClick(msg1),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$checked(_p1._1),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$style(
										{
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'padding', _1: '10px 0'},
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$label,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$style(
								{
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'padding-right', _1: '10px'},
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text(name),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$button,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Events$onClick(msg2),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$id('loadGeometryButton'),
									_1: {ctor: '[]'}
								}
							},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text('svg'),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _user$project$GeometriesView$highLightLine_ = function (_p2) {
	var _p3 = _p2;
	var _p4 = _p3._0;
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A4(
				_user$project$GeometriesView$chb,
				{ctor: '_Tuple2', _0: _p4, _1: _p3._1},
				_user$project$Messages$HighLightGeometry(_p4),
				_user$project$Messages$LoadGeometryButton(_p4),
				_p4),
			_1: {ctor: '[]'}
		});
};
var _user$project$GeometriesView$fluxLine_ = F2(
	function (n, _p5) {
		var _p6 = _p5;
		var _p7 = _p6._0;
		return A2(
			_elm_lang$html$Html$div,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A3(
					_user$project$GeometriesView$checkbox,
					_p6._1,
					A2(_user$project$Messages$CheckNodeGeometryProperty, n, _p7),
					_p7),
				_1: {ctor: '[]'}
			});
	});
var _user$project$GeometriesView$exposeList_ = F2(
	function (m_node, list) {
		var _p8 = m_node;
		if (_p8.ctor === 'Nothing') {
			var _p9 = list;
			if (_p9.ctor === '[]') {
				return A2(
					_elm_lang$html$Html$div,
					{ctor: '[]'},
					{ctor: '[]'});
			} else {
				return A2(
					_elm_lang$html$Html$div,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: _user$project$GeometriesView$highLightLine_(_p9._0),
						_1: {
							ctor: '::',
							_0: A2(_user$project$GeometriesView$exposeList_, m_node, _p9._1),
							_1: {ctor: '[]'}
						}
					});
			}
		} else {
			var _p10 = list;
			if (_p10.ctor === '[]') {
				return A2(
					_elm_lang$html$Html$div,
					{ctor: '[]'},
					{ctor: '[]'});
			} else {
				return A2(
					_elm_lang$html$Html$div,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A2(_user$project$GeometriesView$fluxLine_, _p8._0, _p10._0),
						_1: {
							ctor: '::',
							_0: A2(_user$project$GeometriesView$exposeList_, m_node, _p10._1),
							_1: {ctor: '[]'}
						}
					});
			}
		}
	});
var _user$project$GeometriesView$makeKeyValueList = F2(
	function (m_node, model) {
		var _p11 = m_node;
		if (_p11.ctor === 'Nothing') {
			return A2(
				_elm_lang$core$List$map,
				function (x) {
					return {
						ctor: '_Tuple2',
						_0: x.name,
						_1: function () {
							var _p12 = model.geometryId;
							if (_p12.ctor === 'Nothing') {
								return false;
							} else {
								return _elm_lang$core$Native_Utils.eq(x.id, _p12._0);
							}
						}()
					};
				},
				model.dataModel.geometries);
		} else {
			return A2(
				_elm_lang$core$List$map,
				function (x) {
					return {
						ctor: '_Tuple2',
						_0: x.name,
						_1: A2(_user$project$Node$hasGeometry, x.id, _p11._0)
					};
				},
				model.dataModel.geometries);
		}
	});
var _user$project$GeometriesView$expose = function (model) {
	var m_id = function () {
		var _p13 = model.selection;
		if (_p13.ctor === '::') {
			return _elm_lang$core$Maybe$Just(_p13._0);
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	}();
	var m_node = function () {
		var _p14 = m_id;
		if (_p14.ctor === 'Nothing') {
			return _elm_lang$core$Maybe$Nothing;
		} else {
			return A2(_user$project$DataModel$getNodeFromId, _p14._0, model.dataModel.nodes);
		}
	}();
	return A2(
		_user$project$GeometriesView$exposeList_,
		m_node,
		A2(_user$project$GeometriesView$makeKeyValueList, m_node, model));
};
var _user$project$GeometriesView$viewDetail_ = function (model) {
	var _p15 = model.showGeometries;
	if (_p15 === false) {
		return A2(
			_elm_lang$html$Html$div,
			{ctor: '[]'},
			{ctor: '[]'});
	} else {
		return A2(
			_elm_lang$html$Html$div,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$hr,
					{ctor: '[]'},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$id('geometryView'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _user$project$GeometriesView$expose(model),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$button,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Events$onClick(_user$project$Messages$CreateGeometry),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$id('createGeometry'),
									_1: {
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$value('createGeometry'),
										_1: {ctor: '[]'}
									}
								}
							},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text('+'),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$button,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Events$onClick(_user$project$Messages$DeleteGeometry),
									_1: {
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$id('deleteGeometry'),
										_1: {
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$value('deleteGeometry'),
											_1: {ctor: '[]'}
										}
									}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('-'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}
				}
			});
	}
};
var _user$project$GeometriesView$view = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$id('geometries'),
			_1: {
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('vItem'),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'text-align', _1: 'center'},
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$button,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('btn btn-primary'),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$id('btnGeometries'),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Events$onClick(_user$project$Messages$ShowHideGeometries),
							_1: {ctor: '[]'}
						}
					}
				},
				{
					ctor: '::',
					_0: _elm_lang$html$Html$text('Geometries'),
					_1: {ctor: '[]'}
				}),
			_1: {
				ctor: '::',
				_0: _user$project$GeometriesView$viewDetail_(model),
				_1: {ctor: '[]'}
			}
		});
};

var _user$project$GroupsView$makeKeyValueList = F2(
	function (m_node, model) {
		var _p0 = m_node;
		if (_p0.ctor === 'Nothing') {
			return A2(
				_elm_lang$core$List$map,
				function (x) {
					return {
						ctor: '_Tuple2',
						_0: x.name,
						_1: function () {
							var _p1 = model.dataModel.lightedGroup;
							if (_p1.ctor === 'Nothing') {
								return false;
							} else {
								return _elm_lang$core$Native_Utils.eq(x.id, _p1._0);
							}
						}()
					};
				},
				model.dataModel.groups);
		} else {
			return A2(
				_elm_lang$core$List$map,
				function (x) {
					return {
						ctor: '_Tuple2',
						_0: x.name,
						_1: A2(_user$project$Node$inGroup, x.id, _p0._0)
					};
				},
				model.dataModel.groups);
		}
	});
var _user$project$GroupsView$checkbox = F3(
	function (b, msg, name) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$id('checkbox'),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'padding', _1: '10px'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'text-align', _1: 'left'},
								_1: {ctor: '[]'}
							}
						}),
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$label,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$input,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$type_('checkbox'),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Events$onClick(msg),
									_1: {
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$checked(b),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html$text(name),
							_1: {ctor: '[]'}
						}
					}),
				_1: {ctor: '[]'}
			});
	});
var _user$project$GroupsView$fluxLine_ = F2(
	function (n, _p2) {
		var _p3 = _p2;
		var _p4 = _p3._0;
		return A2(
			_elm_lang$html$Html$div,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A3(
					_user$project$GroupsView$checkbox,
					_p3._1,
					A2(_user$project$Messages$CheckNodeGroupProperty, n, _p4),
					_p4),
				_1: {ctor: '[]'}
			});
	});
var _user$project$GroupsView$highLightLine_ = function (_p5) {
	var _p6 = _p5;
	var _p7 = _p6._0;
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A3(
				_user$project$GroupsView$checkbox,
				_p6._1,
				_user$project$Messages$HighLightGroup(_p7),
				_p7),
			_1: {ctor: '[]'}
		});
};
var _user$project$GroupsView$exposeList_ = F2(
	function (m_node, list) {
		var _p8 = m_node;
		if (_p8.ctor === 'Nothing') {
			var _p9 = list;
			if (_p9.ctor === '[]') {
				return A2(
					_elm_lang$html$Html$div,
					{ctor: '[]'},
					{ctor: '[]'});
			} else {
				return A2(
					_elm_lang$html$Html$div,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: _user$project$GroupsView$highLightLine_(_p9._0),
						_1: {
							ctor: '::',
							_0: A2(_user$project$GroupsView$exposeList_, m_node, _p9._1),
							_1: {ctor: '[]'}
						}
					});
			}
		} else {
			var _p10 = list;
			if (_p10.ctor === '[]') {
				return A2(
					_elm_lang$html$Html$div,
					{ctor: '[]'},
					{ctor: '[]'});
			} else {
				return A2(
					_elm_lang$html$Html$div,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A2(_user$project$GroupsView$fluxLine_, _p8._0, _p10._0),
						_1: {
							ctor: '::',
							_0: A2(_user$project$GroupsView$exposeList_, m_node, _p10._1),
							_1: {ctor: '[]'}
						}
					});
			}
		}
	});
var _user$project$GroupsView$expose = function (model) {
	var m_id = function () {
		var _p11 = model.selection;
		if (_p11.ctor === '::') {
			return _elm_lang$core$Maybe$Just(_p11._0);
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	}();
	var m_node = function () {
		var _p12 = m_id;
		if (_p12.ctor === 'Nothing') {
			return _elm_lang$core$Maybe$Nothing;
		} else {
			return A2(_user$project$DataModel$getNodeFromId, _p12._0, model.dataModel.nodes);
		}
	}();
	return A2(
		_user$project$GroupsView$exposeList_,
		m_node,
		A2(_user$project$GroupsView$makeKeyValueList, m_node, model));
};
var _user$project$GroupsView$viewDetail_ = function (model) {
	var _p13 = model.showFunctionalChain;
	if (_p13 === false) {
		return A2(
			_elm_lang$html$Html$div,
			{ctor: '[]'},
			{ctor: '[]'});
	} else {
		return A2(
			_elm_lang$html$Html$div,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$hr,
					{ctor: '[]'},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$id('functionalChainView'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _user$project$GroupsView$expose(model),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$button,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Events$onClick(_user$project$Messages$CreateGroup),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$id('createGroup'),
									_1: {
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$value('createGroup'),
										_1: {ctor: '[]'}
									}
								}
							},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text('+'),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$button,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Events$onClick(_user$project$Messages$DeleteGroup),
									_1: {
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$id('deleteGroup'),
										_1: {
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$value('deleteGroup'),
											_1: {ctor: '[]'}
										}
									}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('-'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}
				}
			});
	}
};
var _user$project$GroupsView$view = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$id('groups'),
			_1: {
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('vItem'),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'text-align', _1: 'center'},
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$button,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('btn btn-primary'),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$id('btnGroups'),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Events$onClick(_user$project$Messages$ShowHideFunctionalChain),
							_1: {ctor: '[]'}
						}
					}
				},
				{
					ctor: '::',
					_0: _elm_lang$html$Html$text('Functional Chain'),
					_1: {ctor: '[]'}
				}),
			_1: {
				ctor: '::',
				_0: _user$project$GroupsView$viewDetail_(model),
				_1: {ctor: '[]'}
			}
		});
};

var _user$project$LayoutView$radio = F4(
	function (s, msg, value, b) {
		return A2(
			_elm_lang$html$Html$label,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$style(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'padding', _1: '5px'},
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$input,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$type_('radio'),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$name(s),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Events$onClick(msg),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$checked(b),
									_1: {ctor: '[]'}
								}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html$text(value),
					_1: {ctor: '[]'}
				}
			});
	});
var _user$project$LayoutView$view = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$fieldset,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$id('layoutset'),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: A4(
						_user$project$LayoutView$radio,
						'layoutBtn',
						_user$project$Messages$SwitchToLayout('dagre'),
						'dagre',
						_elm_lang$core$Native_Utils.eq(
							model.layoutMenu.layout,
							_elm_lang$core$Maybe$Just('dagre'))),
					_1: {
						ctor: '::',
						_0: A4(
							_user$project$LayoutView$radio,
							'layoutBtn',
							_user$project$Messages$SwitchToLayout('circle'),
							'circle',
							_elm_lang$core$Native_Utils.eq(
								model.layoutMenu.layout,
								_elm_lang$core$Maybe$Just('circle'))),
						_1: {ctor: '[]'}
					}
				}),
			_1: {ctor: '[]'}
		});
};

var _user$project$ParametersView$dialogButton = function (caption) {
	return A2(
		_elm_lang$html$Html$button,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('mdl-button mdl-button--raised mdl-button--accent'),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: _elm_lang$html$Html$text(caption),
			_1: {ctor: '[]'}
		});
};
var _user$project$ParametersView$makeKeyValueList = F2(
	function (m_edge, model) {
		var _p0 = m_edge;
		if (_p0.ctor === 'Nothing') {
			return A2(
				_elm_lang$core$List$map,
				function (x) {
					return {
						ctor: '_Tuple2',
						_0: x.name,
						_1: A2(_elm_lang$core$Set$member, x.id, model.dataModel.selectedParameters)
					};
				},
				model.dataModel.parameters);
		} else {
			return A2(
				_elm_lang$core$List$map,
				function (x) {
					return {
						ctor: '_Tuple2',
						_0: x.name,
						_1: A2(_user$project$Link$isActive, x.id, _p0._0)
					};
				},
				model.dataModel.parameters);
		}
	});
var _user$project$ParametersView$checkbox = F3(
	function (b, msg, name) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$id('checkbox'),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'padding', _1: '10px'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'text-align', _1: 'left'},
								_1: {ctor: '[]'}
							}
						}),
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$label,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$input,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$type_('checkbox'),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Events$onClick(msg),
									_1: {
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$checked(b),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html$text(name),
							_1: {ctor: '[]'}
						}
					}),
				_1: {ctor: '[]'}
			});
	});
var _user$project$ParametersView$fluxLine_ = F2(
	function (x, _p1) {
		var _p2 = _p1;
		var _p3 = _p2._0;
		return A2(
			_elm_lang$html$Html$div,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A3(
					_user$project$ParametersView$checkbox,
					_p2._1,
					A2(_user$project$Messages$CheckProperty, x, _p3),
					_p3),
				_1: {ctor: '[]'}
			});
	});
var _user$project$ParametersView$highLightLine_ = function (_p4) {
	var _p5 = _p4;
	var _p6 = _p5._0;
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A3(
				_user$project$ParametersView$checkbox,
				_p5._1,
				_user$project$Messages$SelectedParameters(_p6),
				_p6),
			_1: {ctor: '[]'}
		});
};
var _user$project$ParametersView$exposeList_ = F2(
	function (m_edge, list) {
		var _p7 = m_edge;
		if (_p7.ctor === 'Nothing') {
			var _p8 = list;
			if (_p8.ctor === '[]') {
				return A2(
					_elm_lang$html$Html$div,
					{ctor: '[]'},
					{ctor: '[]'});
			} else {
				return A2(
					_elm_lang$html$Html$div,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: _user$project$ParametersView$highLightLine_(_p8._0),
						_1: {
							ctor: '::',
							_0: A2(_user$project$ParametersView$exposeList_, m_edge, _p8._1),
							_1: {ctor: '[]'}
						}
					});
			}
		} else {
			var _p9 = list;
			if (_p9.ctor === '[]') {
				return A2(
					_elm_lang$html$Html$div,
					{ctor: '[]'},
					{ctor: '[]'});
			} else {
				return A2(
					_elm_lang$html$Html$div,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A2(_user$project$ParametersView$fluxLine_, _p7._0, _p9._0),
						_1: {
							ctor: '::',
							_0: A2(_user$project$ParametersView$exposeList_, m_edge, _p9._1),
							_1: {ctor: '[]'}
						}
					});
			}
		}
	});
var _user$project$ParametersView$expose = function (model) {
	var m_id = function () {
		var _p10 = model.selection;
		if (_p10.ctor === '::') {
			return _elm_lang$core$Maybe$Just(_p10._0);
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	}();
	var m_edge = function () {
		var _p11 = m_id;
		if (_p11.ctor === 'Nothing') {
			return _elm_lang$core$Maybe$Nothing;
		} else {
			return A2(_user$project$DataModel$getEdgeFromId, _p11._0, model.dataModel.edges);
		}
	}();
	return A2(
		_user$project$ParametersView$exposeList_,
		m_edge,
		A2(_user$project$ParametersView$makeKeyValueList, m_edge, model));
};
var _user$project$ParametersView$viewDetail_ = function (model) {
	var _p12 = model.showParameters;
	if (_p12 === false) {
		return A2(
			_elm_lang$html$Html$div,
			{ctor: '[]'},
			{ctor: '[]'});
	} else {
		return A2(
			_elm_lang$html$Html$div,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$hr,
					{ctor: '[]'},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$id('paramView'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _user$project$ParametersView$expose(model),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$button,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Events$onClick(_user$project$Messages$CreateParameter),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$id('createParameter'),
									_1: {
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$value('createParameter'),
										_1: {ctor: '[]'}
									}
								}
							},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text('+'),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$button,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Events$onClick(_user$project$Messages$DeleteParameter),
									_1: {
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$id('deleteParameter'),
										_1: {
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$value('deleteParameter'),
											_1: {ctor: '[]'}
										}
									}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('-'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}
				}
			});
	}
};
var _user$project$ParametersView$view = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$id('parameters'),
			_1: {
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('vItem'),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'text-align', _1: 'center'},
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$button,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('btn btn-primary'),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$id('btnParameters'),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Events$onClick(_user$project$Messages$ShowHideParameters),
							_1: {ctor: '[]'}
						}
					}
				},
				{
					ctor: '::',
					_0: _elm_lang$html$Html$text('Networks'),
					_1: {ctor: '[]'}
				}),
			_1: {
				ctor: '::',
				_0: _user$project$ParametersView$viewDetail_(model),
				_1: {ctor: '[]'}
			}
		});
};

var _user$project$View$radio = F4(
	function (s, msg, value, b) {
		return A2(
			_elm_lang$html$Html$label,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$style(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'padding', _1: '5px'},
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$input,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$type_('radio'),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$name(s),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Events$onClick(msg),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$checked(b),
									_1: {ctor: '[]'}
								}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html$text(value),
					_1: {ctor: '[]'}
				}
			});
	});
var _user$project$View$onInputFile = function (message) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'change',
		_elm_lang$core$Json_Decode$succeed(message));
};
var _user$project$View$view = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$div,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$fieldset,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$id('fieldset'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A4(
								_user$project$View$radio,
								'viewType',
								_user$project$Messages$SwitchToView(_user$project$Model$Bubble),
								'Bubble Diagram',
								_elm_lang$core$Native_Utils.eq(model.viewType, _user$project$Model$Bubble)),
							_1: {
								ctor: '::',
								_0: A4(
									_user$project$View$radio,
									'viewType',
									_user$project$Messages$SwitchToView(_user$project$Model$Pbs),
									'PBS',
									_elm_lang$core$Native_Utils.eq(model.viewType, _user$project$Model$Pbs)),
								_1: {
									ctor: '::',
									_0: A4(
										_user$project$View$radio,
										'viewType',
										_user$project$Messages$SwitchToView(_user$project$Model$All),
										'All',
										_elm_lang$core$Native_Utils.eq(model.viewType, _user$project$Model$All)),
									_1: {
										ctor: '::',
										_0: A4(
											_user$project$View$radio,
											'viewType',
											_user$project$Messages$SwitchToView(_user$project$Model$Flat),
											'Flat',
											_elm_lang$core$Native_Utils.eq(model.viewType, _user$project$Model$Flat)),
										_1: {
											ctor: '::',
											_0: A4(
												_user$project$View$radio,
												'viewType',
												_user$project$Messages$SwitchToView(_user$project$Model$Geometry),
												'Geometry',
												_elm_lang$core$Native_Utils.eq(model.viewType, _user$project$Model$Geometry)),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}),
					_1: {ctor: '[]'}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$button,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Events$onClick(_user$project$Messages$CreateNode),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$id('new'),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$value('new element'),
								_1: {ctor: '[]'}
							}
						}
					},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text('Block'),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$button,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Events$onClick(_user$project$Messages$CreateLink),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$id('edge'),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$value('edge'),
									_1: {ctor: '[]'}
								}
							}
						},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text('Link'),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$button,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Events$onClick(_user$project$Messages$RenameNode),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$id('rename'),
									_1: {
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$value('rename'),
										_1: {ctor: '[]'}
									}
								}
							},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text('Name'),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: _user$project$LayoutView$view(model),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$div,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$id('leftLayout'),
										_1: {
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$class('vLayout'),
											_1: {ctor: '[]'}
										}
									},
									{
										ctor: '::',
										_0: _user$project$AttributView$view(model),
										_1: {
											ctor: '::',
											_0: _user$project$ElementAttributesView$view(model),
											_1: {
												ctor: '::',
												_0: _user$project$ParametersView$view(model),
												_1: {
													ctor: '::',
													_0: _user$project$GroupsView$view(model),
													_1: {
														ctor: '::',
														_0: _user$project$GeometriesView$view(model),
														_1: {ctor: '[]'}
													}
												}
											}
										}
									}),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$button,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Events$onClick(_user$project$Messages$ExportLink),
											_1: {
												ctor: '::',
												_0: _elm_lang$html$Html_Attributes$id('export'),
												_1: {
													ctor: '::',
													_0: _elm_lang$html$Html_Attributes$value('export'),
													_1: {ctor: '[]'}
												}
											}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text('Export'),
											_1: {ctor: '[]'}
										}),
									_1: {
										ctor: '::',
										_0: A2(
											_elm_lang$html$Html$input,
											{
												ctor: '::',
												_0: _elm_lang$html$Html_Events$onInput(_user$project$Messages$InputChange),
												_1: {
													ctor: '::',
													_0: _elm_lang$html$Html_Attributes$id('input'),
													_1: {
														ctor: '::',
														_0: _elm_lang$html$Html_Attributes$placeholder('undefined'),
														_1: {ctor: '[]'}
													}
												}
											},
											{ctor: '[]'}),
										_1: {
											ctor: '::',
											_0: A2(
												_elm_lang$html$Html$input,
												{
													ctor: '::',
													_0: _elm_lang$html$Html_Events$onInput(_user$project$Messages$InputFileChange),
													_1: {
														ctor: '::',
														_0: _elm_lang$html$Html_Attributes$id('inputFile'),
														_1: {
															ctor: '::',
															_0: _elm_lang$html$Html_Attributes$placeholder('undefined'),
															_1: {ctor: '[]'}
														}
													}
												},
												{ctor: '[]'}),
											_1: {
												ctor: '::',
												_0: A2(
													_elm_lang$html$Html$button,
													{
														ctor: '::',
														_0: _elm_lang$html$Html_Events$onClick(_user$project$Messages$SaveModel),
														_1: {
															ctor: '::',
															_0: _elm_lang$html$Html_Attributes$id('saveModel'),
															_1: {
																ctor: '::',
																_0: _elm_lang$html$Html_Attributes$value('saveModel'),
																_1: {ctor: '[]'}
															}
														}
													},
													{
														ctor: '::',
														_0: _elm_lang$html$Html$text('Save'),
														_1: {ctor: '[]'}
													}),
												_1: {
													ctor: '::',
													_0: A2(
														_elm_lang$html$Html$input,
														{
															ctor: '::',
															_0: _user$project$View$onInputFile(_user$project$Messages$LoadModel),
															_1: {
																ctor: '::',
																_0: _elm_lang$html$Html_Attributes$id(model.loadModelId),
																_1: {
																	ctor: '::',
																	_0: _elm_lang$html$Html_Attributes$type_('file'),
																	_1: {
																		ctor: '::',
																		_0: _elm_lang$html$Html_Attributes$accept('.json,.csv,.csv2'),
																		_1: {ctor: '[]'}
																	}
																}
															}
														},
														{ctor: '[]'}),
													_1: {
														ctor: '::',
														_0: A2(
															_elm_lang$html$Html$input,
															{
																ctor: '::',
																_0: _user$project$View$onInputFile(_user$project$Messages$ImportModel),
																_1: {
																	ctor: '::',
																	_0: _elm_lang$html$Html_Attributes$id('importModel'),
																	_1: {
																		ctor: '::',
																		_0: _elm_lang$html$Html_Attributes$type_('file'),
																		_1: {
																			ctor: '::',
																			_0: _elm_lang$html$Html_Attributes$accept('.json,.csv'),
																			_1: {ctor: '[]'}
																		}
																	}
																}
															},
															{ctor: '[]'}),
														_1: {
															ctor: '::',
															_0: A2(
																_elm_lang$html$Html$input,
																{
																	ctor: '::',
																	_0: _user$project$View$onInputFile(_user$project$Messages$LoadGeometry),
																	_1: {
																		ctor: '::',
																		_0: _elm_lang$html$Html_Attributes$id('loadGeometry'),
																		_1: {
																			ctor: '::',
																			_0: _elm_lang$html$Html_Attributes$type_('file'),
																			_1: {
																				ctor: '::',
																				_0: _elm_lang$html$Html_Attributes$accept('.svg'),
																				_1: {ctor: '[]'}
																			}
																		}
																	}
																},
																{ctor: '[]'}),
															_1: {
																ctor: '::',
																_0: A2(
																	_elm_lang$html$Html$button,
																	{
																		ctor: '::',
																		_0: _elm_lang$html$Html_Events$onClick(_user$project$Messages$SaveToImage),
																		_1: {
																			ctor: '::',
																			_0: _elm_lang$html$Html_Attributes$id('png'),
																			_1: {
																				ctor: '::',
																				_0: _elm_lang$html$Html_Attributes$value('png'),
																				_1: {ctor: '[]'}
																			}
																		}
																	},
																	{
																		ctor: '::',
																		_0: _elm_lang$html$Html$text('Print'),
																		_1: {ctor: '[]'}
																	}),
																_1: {
																	ctor: '::',
																	_0: A2(
																		_elm_lang$html$Html$button,
																		{
																			ctor: '::',
																			_0: _elm_lang$html$Html_Events$onClick(_user$project$Messages$OnOpen),
																			_1: {
																				ctor: '::',
																				_0: _elm_lang$html$Html_Attributes$id('open'),
																				_1: {
																					ctor: '::',
																					_0: _elm_lang$html$Html_Attributes$value('open'),
																					_1: {ctor: '[]'}
																				}
																			}
																		},
																		{
																			ctor: '::',
																			_0: _elm_lang$html$Html$text('Open'),
																			_1: {ctor: '[]'}
																		}),
																	_1: {
																		ctor: '::',
																		_0: A2(
																			_elm_lang$html$Html$button,
																			{
																				ctor: '::',
																				_0: _elm_lang$html$Html_Events$onClick(_user$project$Messages$OnImport),
																				_1: {
																					ctor: '::',
																					_0: _elm_lang$html$Html_Attributes$id('import'),
																					_1: {
																						ctor: '::',
																						_0: _elm_lang$html$Html_Attributes$value('import'),
																						_1: {ctor: '[]'}
																					}
																				}
																			},
																			{
																				ctor: '::',
																				_0: _elm_lang$html$Html$text('Import'),
																				_1: {ctor: '[]'}
																			}),
																		_1: {
																			ctor: '::',
																			_0: A2(
																				_elm_lang$html$Html$button,
																				{
																					ctor: '::',
																					_0: _elm_lang$html$Html_Events$onClick(_user$project$Messages$Undo),
																					_1: {
																						ctor: '::',
																						_0: _elm_lang$html$Html_Attributes$id('undo'),
																						_1: {
																							ctor: '::',
																							_0: _elm_lang$html$Html_Attributes$value('undo'),
																							_1: {ctor: '[]'}
																						}
																					}
																				},
																				{
																					ctor: '::',
																					_0: _elm_lang$html$Html$text('Undo'),
																					_1: {ctor: '[]'}
																				}),
																			_1: {
																				ctor: '::',
																				_0: A2(
																					_elm_lang$html$Html$button,
																					{
																						ctor: '::',
																						_0: _elm_lang$html$Html_Events$onClick(_user$project$Messages$GroupNodes),
																						_1: {
																							ctor: '::',
																							_0: _elm_lang$html$Html_Attributes$id('group'),
																							_1: {
																								ctor: '::',
																								_0: _elm_lang$html$Html_Attributes$value('group'),
																								_1: {ctor: '[]'}
																							}
																						}
																					},
																					{
																						ctor: '::',
																						_0: _elm_lang$html$Html$text('Group'),
																						_1: {ctor: '[]'}
																					}),
																				_1: {
																					ctor: '::',
																					_0: A2(
																						_elm_lang$html$Html$button,
																						{
																							ctor: '::',
																							_0: _elm_lang$html$Html_Events$onClick(_user$project$Messages$UpdateTightness),
																							_1: {
																								ctor: '::',
																								_0: _elm_lang$html$Html_Attributes$id('Tight'),
																								_1: {
																									ctor: '::',
																									_0: _elm_lang$html$Html_Attributes$value('Tight'),
																									_1: {ctor: '[]'}
																								}
																							}
																						},
																						{
																							ctor: '::',
																							_0: _elm_lang$html$Html$text('Tight'),
																							_1: {ctor: '[]'}
																						}),
																					_1: {
																						ctor: '::',
																						_0: A2(
																							_elm_lang$html$Html$button,
																							{
																								ctor: '::',
																								_0: _elm_lang$html$Html_Events$onClick(_user$project$Messages$GetPositions),
																								_1: {
																									ctor: '::',
																									_0: _elm_lang$html$Html_Attributes$id('pos'),
																									_1: {
																										ctor: '::',
																										_0: _elm_lang$html$Html_Attributes$value('pos'),
																										_1: {ctor: '[]'}
																									}
																								}
																							},
																							{
																								ctor: '::',
																								_0: _elm_lang$html$Html$text('Pos'),
																								_1: {ctor: '[]'}
																							}),
																						_1: {
																							ctor: '::',
																							_0: A2(
																								_elm_lang$html$Html$button,
																								{
																									ctor: '::',
																									_0: _elm_lang$html$Html_Events$onClick(_user$project$Messages$Redo),
																									_1: {
																										ctor: '::',
																										_0: _elm_lang$html$Html_Attributes$id('redo'),
																										_1: {
																											ctor: '::',
																											_0: _elm_lang$html$Html_Attributes$value('redo'),
																											_1: {ctor: '[]'}
																										}
																									}
																								},
																								{
																									ctor: '::',
																									_0: _elm_lang$html$Html$text('Redo'),
																									_1: {ctor: '[]'}
																								}),
																							_1: {
																								ctor: '::',
																								_0: A2(
																									_elm_lang$html$Html$button,
																									{
																										ctor: '::',
																										_0: _elm_lang$html$Html_Events$onClick(_user$project$Messages$Propagation),
																										_1: {
																											ctor: '::',
																											_0: _elm_lang$html$Html_Attributes$id('propagation'),
																											_1: {
																												ctor: '::',
																												_0: _elm_lang$html$Html_Attributes$value('propagation'),
																												_1: {ctor: '[]'}
																											}
																										}
																									},
																									{
																										ctor: '::',
																										_0: _elm_lang$html$Html$text('Propagation'),
																										_1: {ctor: '[]'}
																									}),
																								_1: {
																									ctor: '::',
																									_0: A2(
																										_elm_lang$html$Html$img,
																										{
																											ctor: '::',
																											_0: _elm_lang$html$Html_Attributes$id('logo'),
																											_1: {
																												ctor: '::',
																												_0: _elm_lang$html$Html_Attributes$src('LogoSirehna_DC.png'),
																												_1: {
																													ctor: '::',
																													_0: _elm_lang$html$Html_Attributes$title('logo sirehna'),
																													_1: {ctor: '[]'}
																												}
																											}
																										},
																										{ctor: '[]'}),
																									_1: {
																										ctor: '::',
																										_0: A2(
																											_elm_lang$html$Html$div,
																											{
																												ctor: '::',
																												_0: _elm_lang$html$Html_Attributes$id('label'),
																												_1: {ctor: '[]'}
																											},
																											{
																												ctor: '::',
																												_0: _elm_lang$html$Html$text(
																													_user$project$ModelActions$getNodeViewLabel(model)),
																												_1: {ctor: '[]'}
																											}),
																										_1: {
																											ctor: '::',
																											_0: A2(
																												_elm_lang$html$Html$div,
																												{
																													ctor: '::',
																													_0: _elm_lang$html$Html_Attributes$id('counter'),
																													_1: {ctor: '[]'}
																												},
																												{
																													ctor: '::',
																													_0: _elm_lang$html$Html$text(
																														_user$project$ModelActions$getCounterViewLabel(model)),
																													_1: {ctor: '[]'}
																												}),
																											_1: {ctor: '[]'}
																										}
																									}
																								}
																							}
																						}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		});
};
var _user$project$View$init = {ctor: '_Tuple2', _0: _user$project$Model$defaultModel, _1: _elm_lang$core$Platform_Cmd$none};

var _user$project$Main$subscriptions = function (model) {
	return _elm_lang$core$Platform_Sub$batch(
		{
			ctor: '::',
			_0: _user$project$LinkToJS$selection(_user$project$Messages$Selection),
			_1: {
				ctor: '::',
				_0: _user$project$LinkToJS$modeltoelm(_user$project$Messages$ModelToElm),
				_1: {
					ctor: '::',
					_0: _user$project$LinkToJS$csvmodeltoelm(_user$project$Messages$CsvModelToElm),
					_1: {
						ctor: '::',
						_0: _user$project$LinkToJS$csv2modeltoelm(_user$project$Messages$Csv2ModelToElm),
						_1: {
							ctor: '::',
							_0: _user$project$LinkToJS$importModeltoelm(_user$project$Messages$ImportModelToElm),
							_1: {
								ctor: '::',
								_0: _user$project$LinkToJS$importCsvModeltoelm(_user$project$Messages$ImportCsvModeltoElm),
								_1: {
									ctor: '::',
									_0: _user$project$LinkToJS$doubleclick(_user$project$Messages$DoubleClick),
									_1: {
										ctor: '::',
										_0: _user$project$LinkToJS$nodesPositionToElm(_user$project$Messages$NodesPositionToElm),
										_1: {
											ctor: '::',
											_0: _user$project$LinkToJS$nodesPositionRequest(_user$project$Messages$NodesPositionRequest),
											_1: {
												ctor: '::',
												_0: _user$project$LinkToJS$sendGeometryToElm(_user$project$Messages$SendGeometryToElm),
												_1: {
													ctor: '::',
													_0: _elm_lang$keyboard$Keyboard$ups(_user$project$Messages$KeyUps),
													_1: {
														ctor: '::',
														_0: _elm_lang$keyboard$Keyboard$downs(_user$project$Messages$KeyDowns),
														_1: {ctor: '[]'}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		});
};
var _user$project$Main$init = {ctor: '_Tuple2', _0: _user$project$Model$defaultModel, _1: _elm_lang$core$Platform_Cmd$none};
var _user$project$Main$main = _elm_lang$html$Html$program(
	{init: _user$project$Main$init, view: _user$project$View$view, update: _user$project$Actions$update, subscriptions: _user$project$Main$subscriptions})();

var Elm = {};
Elm['Main'] = Elm['Main'] || {};
if (typeof _user$project$Main$main !== 'undefined') {
    _user$project$Main$main(Elm['Main'], 'Main', undefined);
}

if (typeof define === "function" && define['amd'])
{
  define([], function() { return Elm; });
  return;
}

if (typeof module === "object")
{
  module['exports'] = Elm;
  return;
}

var globalElm = this['Elm'];
if (typeof globalElm === "undefined")
{
  this['Elm'] = Elm;
  return;
}

for (var publicModule in Elm)
{
  if (publicModule in globalElm)
  {
    throw new Error('There are two Elm modules called `' + publicModule + '` on this page! Rename one of them.');
  }
  globalElm[publicModule] = Elm[publicModule];
}

}).call(this);

