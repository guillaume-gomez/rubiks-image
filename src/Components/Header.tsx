import logo from '/logo.svg'

function Header() {
  return (
    <div className="navbar bg-primary text-primary-content">
      <img src={logo} alt="logo of Rubick image" width="64px"/>
      <a className="btn btn-ghost normal-case text-xl">Rubick's Image</a>
    </div>
  );
}

export default Header;