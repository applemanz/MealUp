import React from 'react';
import { View, Image, Text, TouchableHighlight, Avatar, Picker } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import {Button} from 'react-native-elements';
import { StackNavigator } from 'react-navigation';
import firebase from "../config/firebase";
// import { userName, userID } from '../screens/SignInScreen';

const userID = '10210889686788547'
const userName = 'Andrew Zeng'
const db = firebase.firestore();

export default class FinalRequestScreen extends React.Component {

	state = {location: ""}

	render() {
		const { params } = this.props.navigation.state;
		const name = params ? params.name : null;
		const friendID = params ? params.id : null;
		const url = params ? params.url : null;
    const time = params ? params.time : null;
    const dateobj = params ? params.dateobj : null;
    const date = params ? params.date : null;
		const firstName = name.split(' ')[0];

		return (
			<View style = {{flex:1}}>
			<NavigationBar componentLeft={<View style={{flex: 1}}><TouchableHighlight underlayColor='transparent' style={{padding: 20}} onPress={() => this.props.navigation.goBack()}><Text style={{fontSize: 15, color: 'white'}}>Back</Text></TouchableHighlight></View>} componentCenter={<View style={{flex: 1}}><Text style={{fontSize: 20, color: 'white'}}>Meal Request with {firstName}</Text></View>}/>

			<View style={{justifyContent: "center",alignItems: "center",padding:30}}>
			<Image
         		style={{width: 100, height: 100, borderRadius: 50}}
         		source={{uri: `http://graph.facebook.com/${friendID}/picture?type=large`}}
       		/>
			<Text>{name}</Text>
			<Text>{time}</Text>
			</View>
			<View style={{justifyContent: "center",alignItems: "center"}}>
			<Text>select a location:</Text>
			</View>

			<Picker
				selectedValue = {this.state.location}
				onValueChange = {(itemValue, itemIndex) => {this.setState({location: itemValue})}}>
  				<Picker.Item label="Forbes" value="Forbes" />
  				<Picker.Item label="Wucox" value="Wucox" />
  				<Picker.Item label="Whitman" value="Whitman" />
  				<Picker.Item label="Roma" value="Roma" />
  				<Picker.Item label="CJL" value="CJL" />
  				<Picker.Item label="Grad College" value="Grad College" />
  				<Picker.Item label="Late Meal" value="Late Meal" />
  			</Picker>
			<Button title="Submit" onPress={this.submitRequest}/>
			</View>
			);
		}

    submitRequest = () => {
      prevData = this.props.navigation.state.params
      data = new Object()
      data['FriendName'] = prevData['name']
      data['FriendID'] = prevData['id']
      data['Location'] = this.state.location
      data['DateTime'] = new Date()
      data['Length'] = 1
      db.collection("users").doc(userID).collection('Sent Requests').add(data)
          .then(function(docRef) {
              console.log("Document written with ID: ", docRef.id);
              data['FriendName'] = userName
              data['FriendID'] = userID
              db.collection("users").doc(prevData['id']).collection('Received Requests').doc(docRef.id).set(data)
          })
          .catch(function(error) {
              console.error("Error adding document: ", error);
          });
      this.props.navigation.popToTop()
    }
	}
