// noinspection JSValidateTypes
import React, { useState, useEffect } from 'react'
import { Alert, View, Platform } from 'react-native'
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Button, Text, TextInput } from 'react-native-paper';
import { GlobalStyles } from '../lib/constants'
import { supabase } from '../lib/initSupabase'
import * as WebBrowser from 'expo-web-browser';
import { registerForPushNotificationsAsync } from '../components/PushNotifications';

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [signUpLoading, setSignUpLoading] = useState(Boolean(false))
  const [signInLoading, setSignInLoading] = useState(Boolean(false))
  const [googleSingInLoading, setGoogleSingInLoading] = useState(Boolean(false));

  const handleDeviceToken = async (userId) => {
    try {
      const token = await registerForPushNotificationsAsync(Device, Notifications, Platform);
      console.log('token', token)
      const { data, error } = await supabase
        .from('users')
        .update({ deviceToken: token })
        .eq('id', userId);
      console.log('handleDeviceToken', data, error);
    } catch (error) {
      console.error('error', error);
    }
  }

  const handleLogin = async (type, email, password) => {
    type === 'LOGIN' ? setSignInLoading(true) : setSignUpLoading(true)
    const { error, user } =
      type === 'LOGIN'
        ? await supabase.auth.signIn({ email, password })
        : await supabase.auth.signUp({ email, password }, {
          data: { 
            role: 'attendee' 
          }
        })
    if (!error && user) await handleDeviceToken(user.id);
    if (!error && !user) Alert.alert('Check your email for the login link!')
    if (error) Alert.alert(error.message)
    setSignUpLoading(false)
    setSignInLoading(false)
  }

  const handleSignUp = async (email, password) => {
    setSignUpLoading(true);
    const { error, user } = await supabase.auth.signUp({ email, password }, {
      data: { 
        role: 'attendee' 
      }
    })

    if (!error && user) Alert.alert('Check your email for the login link!')
    if (error) Alert.alert(error.message)
    setSignUpLoading(false)
    
  }


  async function signInWithProvider(provider) {
    try {
      setGoogleSingInLoading(true)
      const res = await supabase.auth.signIn({
        provider,
      }, {
        redirectTo: 'exp://192.168.0.160:19000'
      })
      let googleAuthUrl = res.url + `&redirect_to=${process.env.REACT_NATIVE_SUPABASE_URL}/auth/v1/callback`;
      let result = await WebBrowser.openAuthSessionAsync(googleAuthUrl);
      let urlString = result.url.replace('#', '?');
      let url = new URL(urlString);
      let refreshToken = url.searchParams.get('refresh_token');
      const { error } = await supabase.auth.signIn({ refreshToken });
      if (error) Alert.alert(error.message);
      setGoogleSingInLoading(false);
    } catch (error) {
      if (error) Alert.alert(error.message);
      setGoogleSingInLoading(false);
    }
  }

  return (
    <View style={GlobalStyles.container}>
      <View style={{ marginHorizontal: 5 }}>
        <Text style={GlobalStyles.headerText}>Face Indexer App</Text>
        <Text style={{ marginBottom: 15 }}>Upload your faces for facial recognition attendance taking. This application is for attendees only.</Text>
        <Text style={GlobalStyles.subHeaderText}>Login or create a new account</Text>
      </View>
      <View style={GlobalStyles.verticallySpaced}>
        <TextInput
          label="Email"
          mode="outlined"
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="george@fakeblock.com"
          left={<TextInput.Icon name="email" />}
        />
      </View>
      <View style={GlobalStyles.verticallySpaced}>
        <TextInput
          label="Password"
          mode="outlined"
          left={<TextInput.Icon name="lock" />}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
        />
      </View>
      <View style={[GlobalStyles.verticallySpaced, { marginTop: 20 }]}>
        <Button
          mode="contained"
          disabled={signInLoading}
          loading={signInLoading}
          onPress={() => handleLogin('LOGIN', email, password)}
        >
          Sign in
        </Button>
      </View>
      <View style={GlobalStyles.verticallySpaced}>
        <Button
          mode="contained"
          disabled={signUpLoading}
          loading={signUpLoading}
          onPress={() => handleSignUp(email, password)}
        >
          Sign up
        </Button>
      </View>
      <View style={[GlobalStyles.verticallySpaced]}>
        <Button
          mode="contained"
          color="#4285f4"
          disabled={googleSingInLoading}
          loading={googleSingInLoading}
          onPress={() => signInWithProvider('google')}
        >
          Sign in with Google
        </Button>
      </View>
      <View style={[GlobalStyles.verticallySpaced]}>
        <Button
          mode="outlined"
          color="#050505"
          disabled={googleSingInLoading}
          loading={googleSingInLoading}
          onPress={() => signInWithProvider('azure')}
        >
          Sign in with Microsoft
        </Button>
      </View>
    </View>
  )
}