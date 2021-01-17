import { createGlobalStyle, ThemeProvider } from 'styled-components'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './global.css';
import Head from "next/head";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
`

const theme = {
  colors: {
    primary: '#0070f3',
  },
}

export default function App({ Component, pageProps }) {  
  return (
    <>
      <GlobalStyle />
      <Head>
        <link
          rel="preload"
          href="/fonts/Now/Now-Regular.otf"
          as="font"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/fonts/Now/Now-Medium.otf"
          as="font"
          crossOrigin=""
        />
        <title>groupShot</title>
        <link rel="icon" href="favicon.svg" />
        <link rel="mask-icon" href="favicon.svg" color="#ffffff"/>
        <link rel="apple-touch-icon" href="favicon.svg"/>
      </Head>
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
        <ToastContainer />
      </ThemeProvider>
    </>
  )
}
