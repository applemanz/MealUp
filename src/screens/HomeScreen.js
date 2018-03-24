import React from 'react';
import { View, SectionList, Text } from 'react-native';
import {ListItem} from 'react-native-elements';
import NavigationBar from 'navigationbar-react-native';

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Meals'
  };

  onPressItem () {

  }

  render() {
    return (
      <View>
        <NavigationBar componentCenter={<Text style={{fontSize: 20, fontWeight: 'bold', color: 'white'}}>Meals</Text>}/>
        <SectionList renderItem={({item}) =>
            <ListItem /*style={styles.item}*/
            title={item.name} /*subtitle={item.startTime}*/
            onPress={() => this.onPressItem}/>}
            renderSectionHeader={({section}) =>
            <Text style={{fontSize: 20, fontWeight: 'bold'}}>{section.title}</Text>}
            sections={[{title: 'MONDAY', data: [{name: 'Meal0', key: '0'}, {name: 'Meal1', key: '1'}]},
            {title: 'TUESDAY', data: [{name: 'Meal2', key: '2'}, {name: 'Meal3', key: '3'}, {name: 'Meal4', key: '4'}]},
            {title: 'WEDNESDAY', data: [{name: 'Meal5', key: '5'}, {name: 'Meal6', key: '6'}, {name: 'Meal7', key: '7'}]}]} keyExtractor={(item) => item.key}/>
      </View>
    );
  }
}
