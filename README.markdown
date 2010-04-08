ToggleJS
========

ToggleJS is a LowPro and Prototype-based library with a collection of 
behaviors for unobtrusively toggling the visibility of other elements via 
links, checkboxes, radio buttons, and selects.

Dependencies: prototype.js, lowpro.js, effect.js

Homepage: <http://github.com/fivepointssolutions/togglejs>


Using ToggleJS
--------------------------------------------------------------------------

To use ToggleJS you will need to have Prototype and LowPro installed and 
loaded, and the following LowPro behaviors will need to be configured. If 
you are using Rails, put this in "application.js":

    Event.addBehavior({
      'a.toggle': Toggle.LinkBehavior(),
      'input[type=checkbox].toggle': Toggle.CheckboxBehavior(),
      'div.radio_group.toggle': Toggle.RadioGroupBehavior(),
      'select.toggle': Toggle.SelectBehavior()
    });

Once the hooks are installed correctly, you should add a `rel` attribute
to each element that you want to use as a toggle trigger. Set the value
of the `rel` attribute to "toggle[id]" where id is equal to the ID of
the element that you want to toggle. You can toggle multiple elements by 
separating the IDs with commas (like this: "toggle[id1,id2,id3]").

For example, a link with a class of "toggle":

    <a class="toggle" href="#more" rel="toggle[more]">More</a>

...will become a trigger for a div with an ID of "more". Checkboxes work
in the exact same manner. To use with a group of radio buttons, make sure
that all of the radio buttons are inside of a div with a class of
"radio_group toggle". Then set the "rel" attribute on each radio button
that should act as a toggle trigger. Selects work in a similar manner,
but the "rel" attribute should be set on each option element that should
toggle the visibility of an element or array of elements.

Each of the included LowPro behaviors can be customized in various ways.
Check out the inline documentation for detailed usage information.


License and Copyright
--------------------------------------------------------------------------

Copyright (c) 2007-2010, Five Points Solutions, Inc.  
Copyright (c) 2010, John W. Long

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.