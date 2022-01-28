import React, { useState } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GlobalStyles } from "../lib/constants";
import { Button, Text } from 'react-native-paper';

export default function ToDoListScreen({ navigation }) {

  return (
    <View style={GlobalStyles.container}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 5,
        marginBottom: 20
      }}>
        <Text style={GlobalStyles.headerText}>Ai Attandence</Text>
        <Button
          onPress={() => navigation.navigate('Camera')}
          mode="contained"
          style={{ width: 75, height: 38, marginTop: 20 }}
        >
          New
        </Button>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}
