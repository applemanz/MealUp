import React from 'react';
import { View, Image, Text, TouchableOpacity, FlatList } from 'react-native';
import {Button} from 'react-native-elements';

class MyListItem extends React.PureComponent {
  _onPress = () => {
    this.props.onPressItem(this.props.id);
  };

  render() {
    const textColor = this.props.selected ? "red" : "black";
    return (
      <Button title = {this.props.title} backgroundColor= {textColor }onPress={this._onPress}/>
    );
  }
}

export default class LocationSelector extends React.PureComponent {
  state = {selected: 8, location: ''};

  _keyExtractor = (item, index) => item.id;

  _onPressItem = (id: string) => {
    console.log(id)
    // updater functions are preferred for transactional updates
    this.setState({selected:id, location:});
  };

  _renderItem = ({item}) => {
    if (this.state.selected == item.id) {selected = true}
    else {selected = false;}
    return (<MyListItem
      id={item.id}
      onPressItem={this._onPressItem}
      selected={selected}
      title={item.title}
    />)
  };

  submit = () => {
    prevData = this.props.nav.state.params
    data = new Object()
    data['FriendName'] = prevData['name']
    data['FriendID'] = prevData['id']
    data['Location'] =
    this.props.nav.popToTop()
  }

  render() {
    return (
      <View>
      <FlatList
        data={this.props.data}
        extraData={this.state}
        keyExtractor={this._keyExtractor}
        renderItem={this._renderItem}
      />
      <Button title="Submit" onPress={this.submit}/>
    </View>

    );
  }
}
