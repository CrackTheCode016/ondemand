<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a id="readme-top"></a>
<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->



<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/CrackTheCode016/polkadot-api-ts-boilerplate">
    <img src="https://cryptologos.cc/logos/polkadot-new-dot-logo.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Polkadot API Typescript Boilerplate</h3>

  <p align="center">
    Quickly get started with experimenting with the Polkadot API.  Includes hot-reloading and a clean Typescript environment to work with.
    <br />
  </p>
</div>

<!-- GETTING STARTED -->
## Getting Started

Getting started should be simple - simply `npm install`, and you're off to the races.

### Prerequisites


Be sure `npm` and `npx` is up to date and working:

  ```sh
  npm install npm@latest -g
  ```

### Installation

```sh
npm install
```

<!-- USAGE EXAMPLES -->
## Usage

You can start a hot reloading server with `tsc-watch`, which will automatically apply your code changes live:

```sh
npm run start
```

Alternatively, you can also build the project and run the files manually inside of `dist/`:

```sh
npm run build
```

## Adding a custom chain

If you want to add a custom chain, such as a local one, you need to first get the metadata for your chain. You can replace `ws://localhost:9944` with your node's appropriate URL:

```sh
npx papi add custom --wsUrl ws://localhost:9944
```

Then, make sure you are using the WebSocket client (`wsClient` or `withWebSocket(url)`) and your custom metadata:

```ts
// ...
const wsClient = await withWebSocket("ws://localhost:9944");
const dotApi = wsClient.getTypedApi(custom);

// Then, you can make calls like this...
const last_runtime_upgrade = await dotApi.query.System.LastRuntimeUpgrade.getValue();
console.log(last_runtime_upgrade)
// ...
```

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/CrackTheCode016/polkadot-api-ts-boilerplate.svg?style=for-the-badge
[contributors-url]: https://github.com/CrackTheCode016/polkadot-api-ts-boilerplate/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/CrackTheCode016/polkadot-api-ts-boilerplate.svg?style=for-the-badge
[forks-url]: https://github.com/CrackTheCode016/polkadot-api-ts-boilerplate/network/members
[stars-shield]: https://img.shields.io/github/stars/CrackTheCode016/polkadot-api-ts-boilerplate.svg?style=for-the-badge
[stars-url]: https://github.com/CrackTheCode016/polkadot-api-ts-boilerplate/stargazers
[issues-shield]: https://img.shields.io/github/issues/CrackTheCode016/polkadot-api-ts-boilerplate.svg?style=for-the-badge
[issues-url]: https://github.com/CrackTheCode016/polkadot-api-ts-boilerplate/issues
[license-shield]: https://img.shields.io/github/license/CrackTheCode016/polkadot-api-ts-boilerplate.svg?style=for-the-badge
[license-url]: https://github.com/CrackTheCode016/polkadot-api-ts-boilerplate/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/linkedin_username
[product-screenshot]: images/screenshot.png
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Vue-url]: https://vuejs.org/
[Angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[Angular-url]: https://angular.io/
[Svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[Svelte-url]: https://svelte.dev/
[Laravel.com]: https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[Laravel-url]: https://laravel.com
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[JQuery-url]: https://jquery.com 