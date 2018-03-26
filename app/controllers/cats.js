import Controller from '@ember/controller';
import { mapBy, alias } from '@ember/object/computed';
import { set } from '@ember/object';
import { computed } from '@ember/object';
import DS from 'ember-data';

export default Controller.extend({
  listOfVotes: mapBy('model', 'votes'),
  listOfRanks: mapBy('model', 'rank'),
  totalCatz: alias('model.length'),
  determineSelected: computed('model.@each.votes', function() {
    let catz = this.get('model');
    let rankList = this.get('listOfRanks');
    let totalCats = this.get('totalCatz');
    var leftCat = document.getElementById('contestant-left');
    var rightCat = document.getElementById('contestant-right');
    let catDisplayLeft = Math.floor((Math.random() * totalCats) + 1);
    let catDisplayRight = Math.floor((Math.random() * totalCats) + 1);
    while (catDisplayLeft == catDisplayRight) {
      catDisplayRight = Math.floor((Math.random() * totalCats) + 1);
    }
    catz.forEach((cat) => {
      if (cat.get('rank') == catDisplayLeft) {
        leftCat.src = cat.get('imageUrl');
      }
      if (cat.get('rank') == catDisplayRight) {
        rightCat.src = cat.get('imageUrl');
      }
    })
  }),
  computeRank: computed('model.@each.votes', function() {
    let catz = this.get('model');
    let voteList = this.get('listOfVotes');
    let numberOfCuterCats = 0;
    catz.forEach((cat) => {
      for (let i=0; i<this.get('model.length'); i++) {
        if (cat.get('votes') < voteList[i]) {
          numberOfCuterCats++;
        }
      }
      if (numberOfCuterCats == 0) {
        set(cat, 'rank', 1);
      }
      else {
        set(cat, 'rank', numberOfCuterCats+1);
      }
      numberOfCuterCats = 0;
    })
    catz.save();
    return;
  }),
  sortedCats: computed.sort('model', 'sortBy'),
  sortBy: ['rank'],
  store: Ember.inject.service(),
  firebaseApp: Ember.inject.service(),
  imageIsSelected: false,

  actions: {
    addVote(cat) {
      cat.incrementProperty('votes');
      cat.save();
    },
    removeVote(cat) {
      if(cat.get('votes') > 0) {
        cat.decrementProperty('votes');
      }
      cat.save();
    },
    didSelectImage(files) {
      this.set('imageIsSelected', true);
      let reader = new FileReader();
      reader.onloadend = Ember.run.bind(this, function() {
        var dataURL = reader.result;
        var image = document.getElementById('cat-image');
        image.src = dataURL;
        this.set('file', files[0]);
      });
      //debugger;
      reader.readAsDataURL(files[0]);
    },
    newCat() {
      if (!this.get('imageIsSelected')) {
        alert('Oops..\n\nNo image has been selected! Please click the \'choose file...\' button to select an image to upload.');
        return;
      }
      let catName = this.get('catName');
      if (!catName) {
        alert('Please name your cat. You don\'t want us to do it!');
        return;
      }
      this.set('imageIsSelected', false);
      let store = this.get('store');
      // Prepare for upload
      let file = this.get('file');
      var metadata = {
        contentType: 'image/png',
      };
      const storageRef = this.get('firebaseApp').storage().ref();
      let path = file.name+'.png';
      let uploadTask = storageRef.child(path).put(file, metadata);
      var uploadButton = document.getElementById('upload-button').firstChild;
      // Begin the upload
      uploadTask.on('state_changed', function(snapshot) { // progress handler
        let percent = snapshot.bytesTransferred / snapshot.totalBytes * 100;
        uploadButton.data = Math.round(percent)+'%';
        console.log(percent+'% complete');
      }, function(error) { // error handler
        alert('Oh no!\nThe upload failed.\n*Make sure your file is less than 2048x2048 in size.*\nCheck the console or please try again.');
        console.error('Upload Failed:', error);
      }, function() { // success handler
        let uploadUrl = uploadTask.snapshot.metadata.downloadURLs[0];
        console.log('File available at ', uploadUrl);
        // Create a new cat model record
        let cat = store.createRecord('cat', {
          name: catName,
          imageUrl: uploadUrl
        });
        cat.save();
        uploadButton.data = 'Success!'; // indicates upload is complete
        setTimeout(function(){uploadButton.data = 'Upload!';}, 3000); // restores button text after 3 seconds
      });
      this.set('catName', '');
    }
  }
});
