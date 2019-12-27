# `color-picker component`

## `initial color value`

####   `should pass the markup snapshot`

```html
<div class="container">
  <div class="picker">
    <color-palette>
    </color-palette>
    <color-slider>
    </color-slider>
  </div>
  <div class="panel">
    <div
      class="color"
      style="background-color: rgb(255,0,0)"
    >
    </div>
    <dl>
      <div>
        <dt>
          HEX
        </dt>
        <dd>
          #FF0000
        </dd>
      </div>
      <div>
        <dt>
          RGB
        </dt>
        <dd>
          255, 0, 0
        </dd>
      </div>
      <div>
        <dt>
          HSB
        </dt>
        <dd>
          360, 100, 100
        </dd>
      </div>
      <div>
        <dt>
          HSL
        </dt>
        <dd>
          360, 100, 50
        </dd>
      </div>
    </dl>
  </div>
</div>

```

```html
<div
  class="palette"
  style="background-color: rgb(255, 0, 0);"
>
  <div class="gradients">
  </div>
  <div
    class="handle"
    style="transform: translate(350px, 0px); background-color: rgb(255, 0, 0);"
  >
  </div>
</div>

```

```html
<div class="slider">
  <div
    class="handle"
    style="transform: translate(0px, 0px); background-color: rgb(255, 0, 0);"
  >
  </div>
</div>

```

