import { ChakraProvider } from "@chakra-ui/provider"
import theme from "../theme"


const App = ({ Component, pageProps }) => {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps}/>
    </ChakraProvider>
  )
}

export default App
