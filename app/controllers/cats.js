import Controller from '@ember/controller';
import { mapBy, alias } from '@ember/object/computed';
import { set } from '@ember/object';
import { computed } from '@ember/object';

export default Controller.extend({
  listOfVotes: mapBy('model', 'votes'),
  totalCatz: alias('model.length'),
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
    }
  }
});
