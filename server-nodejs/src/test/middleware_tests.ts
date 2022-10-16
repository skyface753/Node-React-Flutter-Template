import chai from 'chai';
import chaiHttp from 'chai-http';
import { describe } from 'mocha';
import { expect } from 'chai';
import server from '../index';
chai.use(chaiHttp);
import credentials from './credentials.json';

describe('Routes as anonymous', () => {
  describe('/POST anonymous', () => {
    it('Route should be accessible without login - no cookie', (done) => {
      chai
        .request(server)
        .post('/api/test/anonym')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.success).to.be.true;
          expect(res.body.data.message).to.equal('Anonymous');
          done();
        });
    });
  });

  describe('/POST user', () => {
    it('Route should not be accessible anonymous - cookie is required', (done) => {
      chai
        .request(server)
        .post('/api/test/user')
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body.success).to.equal(false);
          done();
        });
    });
  });
  describe('/POST admin', () => {
    it('Route should not be accessible anonymous - cookie is required', (done) => {
      chai
        .request(server)
        .post('/api/test/admin')
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body.success).to.equal(false);
          done();
        });
    });
  });
});

describe('Routes as User', () => {
  let cookie = '';
  let csrfToken = '';
  before((done) => {
    chai
      .request(server)
      .post('/api/auth/login')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({
        username: credentials.user.username,
        password: credentials.user.password,
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.success).to.be.true;
        expect(res.body.data.user.rolefk).to.equal(1);
        cookie = res.header['set-cookie'];
        csrfToken = res.body.data.csrfToken;
        done();
      });
  });
  describe('/POST anonymous', () => {
    it('Route should be accessible without login - no cookie', (done) => {
      chai
        .request(server)
        .post('/api/test/anonym')
        .set('Cookie', cookie)
        .set('X-CSRF-Token', csrfToken)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.success).to.be.true;
          expect(res.body.data.message).to.equal('Anonymous');
          done();
        });
    });
  });
  describe('/POST user', () => {
    it('Route should be accessible user - cookie is required', (done) => {
      chai
        .request(server)
        .post('/api/test/user')
        .set('Cookie', cookie)
        .set('X-CSRF-Token', csrfToken)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.success).to.equal(true);
          expect(res.body.data.user.username).to.equal(
            credentials.user.username
          );
          done();
        });
    });
    describe('/POST admin', () => {
      it('Route should not be accessible user - cookie is required', (done) => {
        chai
          .request(server)
          .post('/api/test/admin')
          .set('Cookie', cookie)
          .set('X-CSRF-Token', csrfToken)
          .end((err, res) => {
            expect(res).to.have.status(403);
            expect(res.body.success).to.equal(false);
            done();
          });
      });
    });
  });
});

describe('Routes as User with token as Bearer', () => {
  let accessToken = '';
  let csrfToken = '';
  before((done) => {
    chai
      .request(server)
      .post('/api/auth/login')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send(credentials.user)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.success).to.be.true;
        expect(res.body.data.user.rolefk).to.equal(1);
        accessToken = res.body.data.accessToken;
        csrfToken = res.body.data.csrfToken;
        done();
      });
  });
  describe('/POST anonymous', () => {
    it('Route should be accessible without login - no cookie or Bearer', (done) => {
      chai
        .request(server)
        .post('/api/test/anonym')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.success).to.be.true;
          expect(res.body.data.message).to.equal('Anonymous');
          done();
        });
    });
  });
  describe('/POST user', () => {
    it('Route should be accessible user - cookie or baerer is required', (done) => {
      chai
        .request(server)
        .post('/api/test/user')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('X-CSRF-Token', csrfToken)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.success).to.equal(true);
          expect(res.body.data.user.username).to.equal(
            credentials.user.username
          );
          done();
        });
    });
    describe('/POST admin', () => {
      it('Route should not be accessible as user - cookie or baerer is required', (done) => {
        chai
          .request(server)
          .post('/api/test/admin')
          .set('Authorization', `Bearer ${accessToken}`)
          .set('X-CSRF-Token', csrfToken)
          .end((err, res) => {
            expect(res).to.have.status(403);
            expect(res.body.success).to.equal(false);
            done();
          });
      });
    });
  });
});

describe('Routes as Admin', () => {
  let cookie = '';
  let csrfToken = '';
  before((done) => {
    chai
      .request(server)
      .post('/api/auth/login')
      .set('content-type', 'application/x-www-form-urlencoded')

      .send({
        username: credentials.admin.username,
        password: credentials.admin.password,
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.success).to.be.true;
        expect(res.body.data.user.rolefk).to.equal(2);
        cookie = res.header['set-cookie'];
        csrfToken = res.body.data.csrfToken;
        done();
      });
  });
  describe('/POST anonymous', () => {
    it('Route should be accessible without login - no cookie', (done) => {
      chai
        .request(server)
        .post('/api/test/anonym')
        .set('Cookie', cookie)
        .set('X-CSRF-Token', csrfToken)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.success).to.be.true;
          expect(res.body.data.message).to.equal('Anonymous');
          done();
        });
    });
  });

  describe('/POST user', () => {
    it('Route should be accessible user - cookie is required', (done) => {
      chai
        .request(server)
        .post('/api/test/user')
        .set('Cookie', cookie)
        .set('X-CSRF-Token', csrfToken)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.success).to.equal(true);
          expect(res.body.data.user.username).to.equal(
            credentials.admin.username
          );
          expect(res.body.data.user.rolefk).to.equal(2);
          done();
        });
    });
  });
  describe('/POST admin', () => {
    it('Route should be accessible admin - cookie is required', (done) => {
      chai
        .request(server)
        .post('/api/test/admin')
        .set('Cookie', cookie)
        .set('X-CSRF-Token', csrfToken)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.success).to.equal(true);
          expect(res.body.data.user.username).to.equal(
            credentials.admin.username
          );
          expect(res.body.data.user.rolefk).to.equal(2);
          done();
        });
    });
  });
});

describe('Routes as User without csrfToken', () => {
  let cookie = '';
  before((done) => {
    chai
      .request(server)
      .post('/api/auth/login')
      .set('content-type', 'application/x-www-form-urlencoded')

      .send({
        username: credentials.user.username,
        password: credentials.user.password,
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.success).to.be.true;
        expect(res.body.data.user.rolefk).to.equal(1);
        cookie = res.header['set-cookie'];
        done();
      });
  });
  describe('/POST anonymous', () => {
    it('Route should be accessible without login - no csrf', (done) => {
      chai
        .request(server)
        .post('/api/test/anonym')
        .set('Cookie', cookie)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.success).to.be.true;
          expect(res.body.data.message).to.equal('Anonymous');
          done();
        });
    });
  });

  describe('/POST user', () => {
    it('Route should not be accessible - user - csrf is required', (done) => {
      chai
        .request(server)
        .post('/api/test/user')
        .set('Cookie', cookie)
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body.success).to.equal(false);
          done();
        });
    });
  });
  describe('/POST admin', () => {
    it('Route should not be accessible - admin - csrf is required', (done) => {
      chai
        .request(server)
        .post('/api/test/admin')
        .set('Cookie', cookie)
        .end((err, res) => {
          expect(res).to.have.status(403);
          expect(res.body.success).to.equal(false);
          done();
        });
    });
  });
});
