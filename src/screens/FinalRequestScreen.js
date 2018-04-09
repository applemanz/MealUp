import React from 'react';
import { View, Image, Text, TouchableHighlight, Avatar, Picker } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import {Button} from 'react-native-elements';
import { StackNavigator } from 'react-navigation';
import firebase from "../config/firebase";
import { userName, userID } from '../screens/SignInScreen';

const db = firebase.firestore();

export default class FinalRequestScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    return {
      title: 'Meal Request',
    }
  };

	state = {location: "Wilcox"}

	render() {
		const { params } = this.props.navigation.state;
		const name = params ? params.name : null;
		const friendID = params ? params.id : null;
		const url = params ? params.url : null;
    const time = params ? params.time : null;
    const dateobj = params ? params.dateobj : null;
    const length = params ? params.length : null;
    const firstName = name.split(' ')[0];
    console.log(dateobj)
		return (
			<View style = {{flex:1}}>
			<View style={{justifyContent: "center",alignItems: "center",padding:30}}>
			<Image
         		style={{width: 100, height: 100, borderRadius: 50}}
         		source={{uri: `http://graph.facebook.com/${friendID}/picture?type=large`}}
       		/>
			<Text style={{fontSize:20, fontWeight:'bold'}}>{name.split(" ")[0]}</Text>
      <Text style={{fontSize:15}}>{dateobj.substring(0,10)}</Text>
			<Text style={{fontSize:15}}>{time}</Text>
			</View>
			<View style={{justifyContent: "center",alignItems: "center"}}>
			<Text>Select a Location:</Text>
			</View>

			<Picker
				selectedValue = {this.state.location}
				onValueChange = {(itemValue, itemIndex) => {this.setState({location: itemValue})}}>
        <Picker.Item label="Wilcox" value="Wilcox" />
        <Picker.Item label="Wu" value="Wu" />
        <Picker.Item label="Rocky" value="Rocky" />
        <Picker.Item label="Matthey" value="Matthey" />
        <Picker.Item label="Whitman" value="Whitman" />
        <Picker.Item label="Frist" value="Frist" />
				<Picker.Item label="Forbes" value="Forbes" />
				<Picker.Item label="CJL" value="CJL" />
				<Picker.Item label="Grad College" value="Grad College" />
  		</Picker>
			<Button title="Submit" backgroundColor='#f4511e' borderRadius={50} raised onPress={this.submitRequest}/>
			</View>
		);
	}

  submitRequest = () => {
    prevData = this.props.navigation.state.params
    reschedule = prevData['reschedule'];
    sent = prevData['sent'];
    data = new Object()
    data['FriendName'] = prevData['name']
    data['FriendID'] = prevData['id']
    data['Location'] = this.state.location
    data['DateTime'] = new Date(prevData['dateobj'])
    data['Length'] = prevData['length']
    data['TimeString'] = prevData['time']
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
    if (reschedule !== undefined) {
      console.log("RESCHEDULE: " + reschedule);
      if (sent) {
        db.collection("users").doc(userID).collection('Sent Requests').doc(reschedule).delete().then(() => {
          console.log("Document successfully deleted!");
          db.collection("users").doc(prevData['id']).collection('Received Requests').doc(reschedule).delete()
        }).catch(function(error) {
          console.error("Error removing document: ", error);
        });
      } else {
        db.collection("users").doc(userID).collection('Received Requests').doc(reschedule).delete().then(() => {
          console.log("Document successfully deleted!");
          db.collection("users").doc(prevData['id']).collection('Sent Requests').doc(reschedule).delete()
        }).catch(function(error) {
          console.error("Error removing document: ", error);
        });
      }
    }
    else console.log("NOT RESCHEDULE");
    this.props.navigation.popToTop()
  }
}
