# Play 🕹

The game is available at https://bellika.dk/exponentile

# Development

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## App
### iOS

After making changes run this command to build and sync the app project 
```bash
pnpm run syncapp
```

To run on iOS run
```bash
npx cap run ios
```

To publish:
1. Open the project in Xcode
2. Click `App` in the left sidebar
3. Goto general and bump version and build number
4. From top nav bar select `Product`>`Archive`
5. Choose desired build and `Distribute App`
6. Pick a relevant option
7. Goto App Store Connect and look at status. For testflight, you might need to click some stuff


# Contributing
Please open an issue before contributing. Others might be working on the same feature and I would hate for some work to be wasted.

Before submitting a PR, please ensure that the code is linted with `ESLint` and prettified with `prettier`
