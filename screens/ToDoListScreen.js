import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GlobalStyles } from "../lib/constants";
import { supabase } from '../lib/initSupabase';
import { Button, Text } from 'react-native-paper';

export default function ToDoListScreen({ navigation }) {
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
        <Button
          onPress={() => navigation.navigate('Camera')}
          mode="contained"
          style={{ width: 75, height: 38, marginTop: 20 }}
        >
          New
        </Button>
      </View>
      <View style={{
        flexDirection: 'column',
        justifyContent: 'space-between',
        marginHorizontal: 5,
        marginBottom: 20
      }}>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}
