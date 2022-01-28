import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GlobalStyles } from "../lib/constants";
import { supabase } from '../lib/initSupabase';
import { Button, Text } from 'react-native-paper';

export default function MainScreen({ navigation }) {
  useEffect(() => {
    fetchUser();
  }, []);
  const [user, setUser] = useState('Loading...');

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
    }
  }

  return (
    <View style={GlobalStyles.container}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 5,
        marginBottom: 20
      }}>
        {!user.firstname && <Text style={GlobalStyles.headerText}>Hello</Text>}
        {user.firstname && <Text style={GlobalStyles.headerText}>Hello, {user.firstname}</Text>}
      </View>
      <View style={{
        flexDirection: 'column',
        justifyContent: 'space-between',
        marginHorizontal: 5,
      }}>
        <Button
          icon={"account-circle-outline"}
          labelStyle={{fontSize: 25}}
          uppercase={false}
          onPress={() => navigation.navigate('CameraScreen', {
            userId: user.id 
          })}
          mode="outlined"
          style={{
            height: '50%',
          }}
          contentStyle={{
            height: '100%',
          }}
        >
          Index Faces
        </Button>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}
