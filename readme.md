# D3Bubbles

_D3Bubbles, Bubble Chart using D3.JS_

See [http://kevin-wenger.ch/sideproject/d3bubbles](http://kevin-wenger.ch/sideproject/d3bubbles) for complete docs and demos.

## Install

A packaged source file includes everything you need to use Isotope.

+ [d3bubbles.min.js](http://kevin-wenger.ch/sideproject/d3bubbles/lib/d3bubbles.min.js)

(comming soon) If you are cool with the command line...

Install with [Bower](http://bower.io): `bower install d3bubbles`

## License

For commercial projects and applications, non-commercial, personal, or open source projects and applications, you may use D3Bubbles under the terms of the [GPL v3 License](http://choosealicense.com/licenses/gpl-v3/). You may use D3Bubbles for free.

## Initialize

### In JavaScript

``` js
var bubbles = new D3Bubbles({
    // options...
    wrapper: '#example',
    container: '#example .plot',
    data: data_plot
    // options...
});

bubbles.init();
bubbles.visualize();

```

### In HTML

``` html
<div id="example">
    <div class="plot"></div>
</div>
```

* * *

By [Kevin Wenger](http://kevin-wenger.ch)

- [Github](http://github.com/Sudei)
- [Bitbucket](https://bitbucket.org/WengerK)
