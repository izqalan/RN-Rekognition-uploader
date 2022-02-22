// noinspection JSValidateTypes
import React, { useState,  useEffect } from 'react'
import { Alert, View, Linking } from 'react-native'
import { Button, Text, TextInput } from 'react-native-paper';
import { GlobalStyles } from '../lib/constants'
import { supabase } from '../lib/initSupabase'
import * as WebBrowser from 'expo-web-browser';

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [signUpLoading, setSignUpLoading] = useState(Boolean(false))
  const [signInLoading, setSignInLoading] = useState(Boolean(false))
  const [googleSingInLoading, setGoogleSingInLoading] = useState(Boolean(false));

  useEffect(() => {
    Linking.addEventListener('url', event => {
      let urlString = event.url.replace('app#', 'app?'); 
      let url = new URL(urlString); 
      let refreshToken = url.searchParams.get('refresh_token'); 
      if (refreshToken) {
        supabase.auth.signIn({ refreshToken }).then(res => { console.log('token', res)});
      }
    });

    const url = "exp://192.168.0.160:19000#access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNjQ1NTAxNDk5LCJzdWIiOiI1Yzk3YTIwNy1lMzg1LTQ4NDYtODNkZi1iZDJmNzJlZjU3NDgiLCJlbWFpbCI6Iml6cWFsYW5AZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJnb29nbGUiXX0sInVzZXJfbWV0YWRhdGEiOnsiYXZhdGFyX3VybCI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hLS9BT2gxNEdoQU9uNWVKRWFKdGhuenlSbmVTNDR3cDd6c25BZFdDVmdsTTFRdHpRPXM5Ni1jIiwiZW1haWwiOiJpenFhbGFuQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJJenFhbGFuIE5vcidJemFkIiwiaXNzIjoiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vdXNlcmluZm8vdjIvbWUiLCJuYW1lIjoiSXpxYWxhbiBOb3InSXphZCIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS0vQU9oMTRHaEFPbjVlSkVhSnRobnp5Um5lUzQ0d3A3enNuQWRXQ1ZnbE0xUXR6UT1zOTYtYyIsInByb3ZpZGVyX2lkIjoiMTE0MTM4Mjk1NzQxMjYwODc4OTQ2Iiwic3ViIjoiMTE0MTM4Mjk1NzQxMjYwODc4OTQ2In0sInJvbGUiOiJhdXRoZW50aWNhdGVkIn0.GJreoafX9MXrEVFiU2CFp8gc9_CNY0r-2uBx_xeRXoY&expires_in=3600&provider_token=ya29.A0ARrdaM8aW1ZLGAf-At5ZPe25PEzGILLndpngl_b-P1PgmxXHJnzbv2ua_yBduDQgh45CupwzV19abPC41lGJCLSSkSE57pwMbYtTKdAsBbQ5UZAovPgCMxelQ-tQPUHSbvlxHBGziVXGon4OmekgWnno-_LltQ&refresh_token=0AK7genfLn8lgkBACojCwg&token_type=bearer";

    let urlString = url.replace('#', '?');
    let nUrl = new URL(urlString);
    let refreshToken = nUrl.searchParams.get('refresh_token');
    console.log('refreshToken', refreshToken);

  }, []);
  const handleLogin = async (type, email, password) => {
    type === 'LOGIN' ? setSignInLoading(true) : setSignUpLoading(true)
    const { error, user } =
      type === 'LOGIN'
        ? await supabase.auth.signIn({ email, password })
        : await supabase.auth.signUp({ email, password })
    if (!error && !user) Alert.alert('Check your email for the login link!')
    if (error) Alert.alert(error.message)
    setSignInLoading(false)
  }

  

  async function signInWithGoogle() {
    setGoogleSingInLoading(true)
    const res = await supabase.auth.signIn({
      provider: 'google',
    })
    let googleAuthUrl = res.url + `&redirect_to=${process.env.REACT_NATIVE_SUPABASE_URL}/auth/v1/callback`;
    let result = await WebBrowser.openAuthSessionAsync(googleAuthUrl);
    let urlString = result.url.replace('#', '?');
    let url = new URL(urlString);
    let refreshToken = url.searchParams.get('refresh_token');
    const { error } = await supabase.auth.signIn({ refreshToken });
    if (error) Alert.alert(error.message);
    setGoogleSingInLoading(false);
  }

  return (
    <View style={GlobalStyles.container}>
      <View style={{ marginHorizontal: 5 }}>
        <Text style={GlobalStyles.headerText}>Face Indexer App</Text>
        <Text style={{ marginBottom: 15 }}>Upload your faces for facial recognition attendance taking.</Text>
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
          onPress={() => handleLogin('SIGNUP', email, password)}
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
          onPress={() => signInWithGoogle()}
        >
          Sign in with Google
        </Button>
      </View>
    </View>
  )
}