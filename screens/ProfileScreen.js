import React, { useState, useEffect } from "react";
import { Alert, View, ScrollView, KeyboardAvoidingView } from "react-native";
import { Button, Text, TextInput } from 'react-native-paper'
import { supabase } from "../lib/initSupabase";
import { GlobalStyles } from "../lib/constants";

export default function ProfileScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [user, setUser] = useState('Loading...');
  const [loading, setLoading] = useState(false)
  const [loadingNameChange, setLoadingNameChange] = useState(false);

  const handleProfileUpdate = async (email, password) => {
    setLoading(true)
    const { error, user } = await supabase.auth.update({ email, password })
    if (!error && !user) Alert.alert('Check your email for the login link!')
    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  const handleNameUpdate = async (userId, firstname, lastname) => {
    setLoadingNameChange(true)
    const { error } = await supabase
      .from('users')
      .update({ firstname, lastname })
      .eq('id', userId)
    if (error) Alert.alert(error.message)
    setLoadingNameChange(false)
  }

  const fetchUser = async () => {
    const currentUser = await supabase.auth.user();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', currentUser.id)
      .single();
    if (error) {
      console.log('error', error)
    }
    else {
      setUser(data);
      setFirstname(data.firstname);
      setLastname(data.lastname);
    }
  }

  useEffect(() => {
    fetchUser();

  }, []);

  return (
    <View style={GlobalStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        enabled
        style={{ flex: 1, flexDirection: 'column',justifyContent: 'center',}}
        keyboardVerticalOffset={100}
      >
        <ScrollView>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginHorizontal: 5,
            marginBottom: 20
          }}>
            <Text style={GlobalStyles.headerText}>Profile</Text>
            <Button
              mode="contained"
              style={{ width: 115, height: 38, marginTop: 20 }}
              onPress={() => supabase.auth.signOut()}
            >
              Sign out
            </Button>
          </View>
          <View style={{ marginHorizontal: 5 }}>
            <Text style={GlobalStyles.subHeaderText}>Update your email or password</Text>
          </View>
          <View style={GlobalStyles.verticallySpaced}>
            <TextInput
              label="New email"
              mode="outlined"
              onChangeText={(text) => setEmail(text)}
              value={email}
              placeholder="george@fakeblock.com"
              left={<TextInput.Icon name="email" />}
            />
          </View>
          <View style={GlobalStyles.verticallySpaced}>
            <TextInput
              label="New password"
              mode="outlined"
              left={<TextInput.Icon name="lock" />}
              onChangeText={(text) => setPassword(text)}
              value={password}
              secureTextEntry={true}
              placeholder="Enter your new password"
            />
          </View>
          <View style={{
            marginHorizontal: 5,
            marginTop: 10
          }}>
            <Button
              mode="contained"
              disabled={loading}
              loading={loading}
              onPress={() => handleProfileUpdate(email, password)}
            >
              Update profile
            </Button>

            <View style={{ marginHorizontal: 5 }}>
              <Text style={GlobalStyles.subHeaderText}>Update your Firsname and Lastname</Text>
            </View>
            <View style={GlobalStyles.verticallySpaced}>
              <TextInput
                label="Enter your Firstname"
                mode="outlined"
                onChangeText={(text) => setFirstname(text)}
                value={firstname}
                placeholder="John"
              />
            </View>
            <View style={GlobalStyles.verticallySpaced}>
              <TextInput
                label="Enter your Lastname"
                mode="outlined"
                onChangeText={(text) => setLastname(text)}
                value={lastname}
                placeholder="Doe"
              />
            </View>
            <View style={{
              marginHorizontal: 5,
              marginTop: 10
            }}>
              <Button
                mode="contained"
                disabled={loadingNameChange}
                loading={loadingNameChange}
                onPress={() => handleNameUpdate(user.id, firstname, lastname)}
              >
                Update name
              </Button>

              <Text style={{
                marginTop: 10
              }}>You will receive an email to your existing email address to confirm email address changes. Password changes are effective immediately.</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}