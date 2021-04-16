# `Application: app-happy-colors`

#### `should match the markup snapshot`

```html
<main>
  <div class="header">
    <div class="container">
      <h1>
        Happy Colors
      </h1>
      <theme-switch active-theme="null">
      </theme-switch>
    </div>
  </div>
  <div class="color-management">
    <h2>
      Pick your color
    </h2>
    <color-overview>
    </color-overview>
    <h2>
      Save your color
    </h2>
    <div class="custom-color-scheme">
      <div class="column">
        <div class="color empty">
        </div>
        <div class="hex">
        </div>
      </div>
      <div class="column">
        <div class="color empty">
        </div>
        <div class="hex">
        </div>
      </div>
      <div class="column">
        <div class="color empty">
        </div>
        <div class="hex">
        </div>
      </div>
      <div class="column">
        <div class="color empty">
        </div>
        <div class="hex">
        </div>
      </div>
    </div>
  </div>
  <div class="color-schemes">
    <h2>
      <span>
        Generated schemes
      </span>
      <span>
        <span class="highlight">
          &
        </span>
        inspiration
      </span>
    </h2>
    <div>
      <div class="color-scheme">
        <div>
          <h3>
            Complementary color scheme
          </h3>
          <p>
            The complementary color scheme adds one opposite (complement)
                  color. This color is on the exact opposite side of the color
                  wheel.
          </p>
        </div>
        <color-scheme
          scheme="complementary"
          show-hex=""
        >
        </color-scheme>
      </div>
      <div class="color-scheme">
        <div>
          <h3>
            Triadic color scheme
          </h3>
          <p>
            The triadic color scheme adds two additional colors. All three
                  colors are distributed evenly around the color wheel.
          </p>
        </div>
        <color-scheme
          scheme="triadic"
          show-hex=""
        >
        </color-scheme>
      </div>
      <div class="color-scheme">
        <div>
          <h3>
            Analogous color scheme
          </h3>
          <p>
            The analogous color scheme adds two additional colors on the
                  color wheel: one on either side of the base color, distributed
                  evenly.
          </p>
        </div>
        <color-scheme
          scheme="analogous"
          show-hex=""
        >
        </color-scheme>
      </div>
      <div class="color-scheme">
        <div>
          <h3>
            Monochromatic color scheme
          </h3>
          <p>
            The monochromatic color scheme consists of a base color, and a
                  range of its shades.
          </p>
        </div>
        <color-scheme scheme="monochromatic">
        </color-scheme>
      </div>
    </div>
  </div>
</main>

```

