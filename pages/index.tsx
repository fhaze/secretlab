import { Text, Box, Flex, Heading, Spacer, Divider, useColorMode, Button, IconButton, useColorModeValue, Modal, useDisclosure, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, FormControl, FormLabel, Input, useToast, Stack, Skeleton, Spinner, ScaleFade, Image, Tag } from "@chakra-ui/react"
import { ArrowRightIcon, MoonIcon, SunIcon } from "@chakra-ui/icons"
import React, { KeyboardEvent, useEffect, useState } from "react"
import axios from "axios"
import e404 from "../assets/404.png"
import e404b from "../assets/404b.png"
import welcome from "../assets/welcome.png"

const appName = process.env.APP_NAME ?? "SecretLab"
const apiHost = process.env.API_HOST ?? "http://localhost:8000/v1/"
axios.defaults.baseURL = apiHost

const IndexPage = () => {
  const [authenticated, setAuthenticated] = useState(false)
  const [profile, setProfile] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)

  const {isOpen, onOpen, onClose} = useDisclosure()
  const [formError, setFormError] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [message, setMessage] = useState('')
  const [messageLoading, setMessageLoading] = useState(false)
  const [signUpLoading, setSignUpLoading] = useState(false)

  const {colorMode, toggleColorMode} = useColorMode()
  const boxBackground = useColorModeValue("white", "gray.700")
  const headerBackground = useColorModeValue("white", "gray.800")
  const background = useColorModeValue("gray.50", "gray.800")

  const initialRef = React.useRef()

  const toast = useToast()

  const getProfile = async () => {
    const res = await axios.get(
      "profile", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
        }
      }
    )
    return res.data
  }

  const getRoot = async () => {
    const res = await axios.get(
      "message", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
        }
      }
    )
    return res.data
  }

  const fetchScreen = async () => {
    try {
      setProfileLoading(true)
      setMessageLoading(true)

      const { name } = await getProfile()
      setProfile(name)
      setProfileLoading(false)
      setAuthenticated(true)

      onClose()
      toast({
        title: "Logged in",
        description: `Hello ${name}! welcome to the SecretLab! 😎`,
        duration: 5 * 1000,
      })

      const root = await getRoot()
      setMessage(root.message)
      setMessageLoading(false)
    } catch {
      localStorage.removeItem("access_token")
      setProfile('')
      setMessage('')
      toast({
        title: "Disconnected",
        description: "You have been disconnected due to timeout.",
        status: "warning",
        duration: 5 * 1000,
      })  
    } finally {
      setProfileLoading(false)
      setMessageLoading(false)
    }
  }

  useEffect(() => {
    if (localStorage.getItem("access_token") != null) {
      const doAsync = async () => {
        await fetchScreen()
      }
      doAsync()
    }
  }, [])


  const signUp = async () => {
    try {
      setFormError('')
      setSignUpLoading(true)

      const res = await axios.post("login",{ username, password })
      const { access_token } = res.data
      
      localStorage.setItem("access_token", access_token)

      await fetchScreen()

      setUsername('')
      setPassword('')
    } catch {
      setFormError('Username or password is incorrect 🤔')
    } finally {
      setSignUpLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setMessageLoading(true)
      setProfileLoading(true)

      localStorage.removeItem("access_token")
      setAuthenticated(false)
      toast({
        title: "See you",
        description: "Quitting already? See you again soon! 👋",
        duration: 5 * 1000,
      })
    } finally {
      setTimeout(() => {
        setMessageLoading(false)
        setProfileLoading(false)
      }, 500)
    }
  }

  const messageBlock = () => {
    if (messageLoading) {
      return (
        <Stack>
          <Skeleton height='150px'/>
          <Skeleton height='20px'/>
        </Stack>
      )
    }
    if (authenticated) {
      return (
        <Stack alignItems="center">
          <Image src={welcome.src} htmlWidth="182px" alt="logo"/>
          <Text>Your secret message is <Tag>{message}</Tag></Text>
        </Stack>
      )
    }
    return (
      <Stack alignItems="center">
        <Image src={colorMode === 'light' ? e404.src : e404b.src} htmlWidth="300px" alt="404"/>
        <Text>You don't have enough permissions to view this page.</Text>
      </Stack>
    )
  }

  const profileBlock = () => {
    if (profileLoading) {
      return <Spinner size='sm'/>
    }
    if (authenticated) {
      return <Text>{profile}</Text>
    }
    return <></>
  }

  const signUpKeyDown = async (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      await signUp()
    }
  }

  return (
    <Box h="100vh" bg={background}>
      <Box>
        <Flex bg={headerBackground}>
          <Box p={4}>
            <Heading size='md'><ArrowRightIcon boxSize="4" color="blue.400"/> {appName}</Heading>
          </Box>
          <Spacer/>
          <Box p={4}>{profileBlock()}</Box>
          <Box p={2}>
            { 
              !authenticated ? 
              <Button colorScheme='blue' mr={4} onClick={onOpen}>
                Sign in
              </Button>
              :
              <Button colorScheme='blue' mr={4} onClick={signOut}>
                Sign out
              </Button>
            }
            <IconButton
              aria-label="color mode"
              onClick={toggleColorMode}
              variant='unstyled'
              icon={colorMode === 'light' ? <SunIcon/> : <MoonIcon/>}
              />
          </Box>
        </Flex>
        <Divider/>
      </Box>
      <Flex justifyContent="center" bg={background}>
        <Box p={4} w={700}>
          <Box boxShadow='md' p={4} rounded='md' bg={boxBackground}>
            {messageBlock()}
          </Box>
        </Box>
      </Flex>
      <Modal
        initialFocusRef={initialRef}
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay/>
        <ModalContent>
          <ModalHeader>Authentication</ModalHeader>
          <ModalCloseButton/>
          <ModalBody pb={6}>

            <FormControl isRequired>
              <FormLabel>Username</FormLabel>
              <Input
                ref={initialRef}
                placeholder="Username"
                onChange={e => setUsername(e.currentTarget.value)}                
                value={username}
                readOnly={signUpLoading}
                onKeyDown={signUpKeyDown}
              />
            </FormControl>

            <FormControl mt={4} isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                placeholder="Password"
                onChange={e => setPassword(e.currentTarget.value)}
                value={password}
                readOnly={signUpLoading}
                onKeyDown={signUpKeyDown}
              />
            </FormControl>

            <Flex>
              { formError ?
                <Text mt={6} flex={1} color='red.500'>
                  <ScaleFade in={!!formError}>{formError}</ScaleFade>
                </Text> : <Spacer/>
              }
              <Button 
                colorScheme="blue" 
                onClick={signUp} 
                type="submit" 
                mt={4} 
                disabled={!username || !password}
                isLoading={signUpLoading}
              >Sign in</Button>
            </Flex>

          </ModalBody>

        </ModalContent>
      </Modal>
    </Box>
  )
}

export default IndexPage
