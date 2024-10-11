# Shopping Cart for Web Domains

[Visit Project](https://web-domains-shopping-cart.vercel.app/)

Frontend shopping cart component to buy web domains.

This project uses React, Next.js, TypeScript, and [Chakra UI](https://chakra-ui.com/) (a popular React component library).

## Details

A shopping cart for domain purchases - The user can input website domain names they want to buy, such as `example.com`; the component calls a mock API to "check" if those domains are available. The user would then be able to view and delete the domain names in their cart. By the end, the user would have exactly `numDomainsRequired` domains in their cart (this is a dummy constraint for this project).

The following outline the core features:

- The 'Map' data structure used to store the domains
- Users can type in a domain name they want to add; hit "Enter" or click a "Add to Cart" to add that domain to a growing set or list.
- The user can see all the domains in their cart, delete certain domains or Clear the entire cart at once.
- When a domain is added to the cart, the `isDomainAvailable` function in `src/lib/resources.ts` is called to check if the domain is available for purchase (according to the mock API -- this just makes up dummy data) and then shows the availability status of each domain.
- Cart displays both available and unavailable domains and updates cart status (i.e., how "full" the cart is/how many to remove to proceed etc.) dynamically.
- If the user's cart contains exactly `numDomainsRequired` domains, the "purchase" button is activated. Clicking purchase button is a no-op.
- A button to remove all unavailable domains from the cart.
- A button to copy the domains in the cart to the clipboard, separated by commas. For instance `[abc.com, def.com, ghi.com]` could be copied as `abc.com, def.com, ghi.com`.
- A button to keep only the `N` "best" domains, where `N` is `numDomainsRequired`. To prioritize domains, I sort them by their domain ending first: `.com` is better than `.app` which is better than `.xyz`. If there are ties, shorter domains win. For instance, one correct ordering is `[abc.com, abcd.com, ab.app, abc.app, a.xyz]`. If there are still ties, the last tiebreaker and lexicographical ordering.
- Usability features like helpful error messages, loading states, confirmation messages, help text, etc.

## Validation

- The domain name should be bare (e.g. `example.com` is OK, but `https://example.com` are `example.com/abc` are not), and it must end with `.com`, `.xyz`, or `.app`. It's OK if the user inputs the domain in mixed case, but when the user adds that domain to the list, it converts it to lowercase (e.g. `Example.Com` => `example.com`).
- The user's cart of domains does not allow duplicates; for instance, if the user has `[example.com, acme.com]` and adds `example.com`, that will be a no-op, since `example.com` is already in there.

## Components

This project uses [Chakra UI](https://chakra-ui.com/docs/components) component library.

### Chakra

Chakra UI offers a variety of useful features

- [Components](https://chakra-ui.com/docs/components)
- [React Hooks](https://chakra-ui.com/docs/hooks/use-clipboard) for copying text and working with form controls
- [Responsive design tools](https://chakra-ui.com/docs/styled-system/responsive-styles#the-object-syntax)
- [Color schemes and variants](https://chakra-ui.com/docs/components/button/theming)

### Node.js modules to refer

- `@chakra-ui/react`
- `react`
- `react-icons`
- `lodash`
- `immutable`

## Getting started

Before running the project, install the required packages:

```sh
npm install
```

Be sure you're using Node version 18 or greater.

## Running your code

To run your code, do:

```sh
npm run dev
```

And open `http://localhost:3000` in your browser.

To check your code's validity, you can run:

- `npm run build`, to ensure your code builds properly
- `npm run lint`, to ensure you pass all lint checks
- `npx tsc`, to ensure that your typings are correct.

## Deployment

This project is deployed on Vercel. [Link](https://web-domains-shopping-cart.vercel.app/)

## Future Work

- Being able to edit existing domains
- A progress bar (or any visual component) to show how "ready" or "full" the cart is for purchase
