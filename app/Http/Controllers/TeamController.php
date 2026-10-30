<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class TeamController extends Controller
{
    private const ASSIGNABLE_ROLES = ['manager', 'staff'];   // never 'owner' or 'super_admin'

    public function index(Request $request)
    {
        $tenantId = $this->tenantId($request);

        $members = User::whereIn('role', ['owner', 'manager', 'staff'])
            ->where('tenant_id', $tenantId)
            ->select('id', 'name', 'email', 'phone', 'role', 'created_at')
            ->orderByRaw("FIELD(role, 'owner', 'manager', 'staff')")
            ->orderBy('name')
            ->get();

        return Inertia::render('AdminPages/Team', [
            'members'   => $members,
            'currentId' => $request->user()->id,
            'roles'     => self::ASSIGNABLE_ROLES,
        ]);
    }
public function store(Request $request)
{
    $tenantId = $this->tenantId($request);
if ($error = $request->user()->tenant->limitError('users')) {
    return back()->withErrors(['email' => $error]);
}
    $validated = $request->validate([
        'name'     => ['required', 'string', 'max:255'],
        'email'    => ['required', 'email', 'max:255', 'unique:users,email'],
        'phone'    => ['nullable', 'string', 'max:20'],
        'password' => ['required', Password::defaults()],
        'role'     => ['required', Rule::in(self::ASSIGNABLE_ROLES)],
    ]);

    // tenant_id always comes from the logged-in owner, never from the form
    $member = new User($validated);
    $member->tenant_id = $tenantId;   // set directly, not through fillable
    $member->save();

    return back()->with('success', 'Team member added.');
}

    public function update(Request $request, User $member)
    {
        $this->ensureTeamMember($request, $member);

        $validated = $request->validate([
            'role' => ['required', Rule::in(self::ASSIGNABLE_ROLES)],
        ]);

        $member->update($validated);

        return back()->with('success', "{$member->name} is now a {$member->role}.");
    }

    public function destroy(Request $request, User $member)
    {
        $this->ensureTeamMember($request, $member);

        $member->delete();

        return back()->with('success', 'Team member removed.');
    }

    private function tenantId(Request $request): int
    {
        $tenantId = $request->user()->tenant_id;

        abort_unless($tenantId, 403);

        return $tenantId;
    }

    /**
     * Route binding on User is not tenant-filtered, so check by hand:
     * same company, a manager or staff (not an owner), and not yourself.
     */
    private function ensureTeamMember(Request $request, User $member): void
    {
        $me = $request->user();

        abort_unless(
            $me->tenant_id
                && $member->tenant_id === $me->tenant_id
                && in_array($member->role, self::ASSIGNABLE_ROLES, true)
                && $member->id !== $me->id,
            404
        );
    }
}